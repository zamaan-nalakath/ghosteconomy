import {
  createUnprovenDeployTx,
  submitCallTxAsync,
  submitTxAsync,
} from '@midnight-ntwrk/midnight-js-contracts';
import { ContractState, sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import {
  CompiledGhostEconomyContract,
  ledger,
  pureCircuits,
} from './contract.js';
import {
  createInitialPrivateState,
  type GhostEconomyPrivateState,
} from '@contracts/witnesses.js';
import type { ConnectedSession } from './midnight';
import { fromHex, pollForState, toHex } from './midnight';

const PRIVATE_STATE_ID = 'ghostEconomyPrivateState';
const SECRET_STORAGE_KEY = 'ghost-economy-secrets';
const INCOME_STORAGE_KEY = 'ghost-economy-income-draft';
export const ZK_PATH = '/zk/ghost-economy';

export type ProfileRegistryEntry = {
  profileCommitment: string;
  workerCommitment: string;
  incomeTier: number;
  consistencyMonths: number;
  tierLabel: string;
};

export type RegistryState = {
  profileCount: number;
  entries: ProfileRegistryEntry[];
};

const TIER_LABELS = ['Unverified', 'Bronze', 'Silver', 'Gold'] as const;

export function incomeTierLabel(tier: number): string {
  return TIER_LABELS[tier] ?? `Tier ${tier}`;
}

function makeCompiledContract() {
  return CompiledGhostEconomyContract as any;
}

function bytesToHex(bytes: Uint8Array): string {
  return toHex(bytes);
}

export function getOrCreateWorkerSecret(): Uint8Array {
  const stored = localStorage.getItem(SECRET_STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored) as { workerSecret: number[] };
    return new Uint8Array(parsed.workerSecret);
  }
  const workerSecret = crypto.getRandomValues(new Uint8Array(32));
  localStorage.setItem(
    SECRET_STORAGE_KEY,
    JSON.stringify({ workerSecret: Array.from(workerSecret) }),
  );
  return workerSecret;
}

export function buildPrivateState(monthlyIncomeCents: number[]): GhostEconomyPrivateState {
  if (monthlyIncomeCents.length !== 12) {
    throw new Error('monthlyIncomeCents must have exactly 12 entries');
  }
  return createInitialPrivateState(getOrCreateWorkerSecret(), monthlyIncomeCents);
}

export function getProfileCommitmentPreview(monthlyIncomeCents: number[]): string {
  const incomes = monthlyIncomeCents.map((v) => BigInt(v));
  return bytesToHex(pureCircuits.profileCommitment(incomes));
}

export function getWorkerCommitmentPreview(): string {
  return bytesToHex(pureCircuits.workerCommitment(getOrCreateWorkerSecret()));
}

export function saveIncomeDraft(monthlyIncomeCents: number[]) {
  localStorage.setItem(INCOME_STORAGE_KEY, JSON.stringify(monthlyIncomeCents));
}

export function loadIncomeDraft(): number[] {
  const stored = localStorage.getItem(INCOME_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as number[];
      if (Array.isArray(parsed) && parsed.length === 12) return parsed;
    } catch {
      /* ignore */
    }
  }
  return Array.from({ length: 12 }, () => 320_000);
}

export async function deployContract(
  session: ConnectedSession,
  monthlyIncomeCents: number[],
): Promise<string> {
  const initialPrivateState = buildPrivateState(monthlyIncomeCents);
  const deployTxData = await (createUnprovenDeployTx as any)(
    {
      zkConfigProvider: session.providers.zkConfigProvider,
      walletProvider: session.providers.walletProvider,
    },
    {
      compiledContract: makeCompiledContract(),
      args: [],
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState,
      signingKey: sampleSigningKey(),
    },
  );
  const contractAddress = deployTxData.public.contractAddress;
  await (submitTxAsync as any)(session.providers, {
    unprovenTx: deployTxData.private.unprovenTx,
  });
  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, initialPrivateState);
  await session.providers.privateStateProvider.setSigningKey(
    contractAddress,
    deployTxData.private.signingKey,
  );
  return contractAddress;
}

export async function joinContract(
  session: ConnectedSession,
  contractAddress: string,
  monthlyIncomeCents: number[],
) {
  const privateState = buildPrivateState(monthlyIncomeCents);
  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, privateState);
}

export async function registerIncomeProfile(
  session: ConnectedSession,
  contractAddress: string,
  monthlyIncomeCents: number[],
  minMonthlyCents: number,
  requiredMonths: number,
) {
  const privateState = buildPrivateState(monthlyIncomeCents);
  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set(PRIVATE_STATE_ID, privateState);

  await (submitCallTxAsync as any)(session.providers, {
    compiledContract: makeCompiledContract(),
    contractAddress,
    circuitId: 'registerIncomeProfile',
    args: [BigInt(minMonthlyCents), BigInt(requiredMonths)],
    privateStateId: PRIVATE_STATE_ID,
  });
}

export function decodeRegistryState(stateHex: string): RegistryState {
  const contractState = ContractState.deserialize(fromHex(stateHex));
  const l = ledger(contractState.data);
  const entries: ProfileRegistryEntry[] = [];

  for (const [key, entry] of l.profiles) {
    const incomeTier = Number(entry.incomeTier);
    entries.push({
      profileCommitment: bytesToHex(key),
      workerCommitment: bytesToHex(entry.workerCommitment),
      incomeTier,
      consistencyMonths: Number(entry.consistencyMonths),
      tierLabel: incomeTierLabel(incomeTier),
    });
  }

  return {
    profileCount: Number(l.nextProfileId as unknown as bigint),
    entries,
  };
}

export async function fetchRegistryState(
  queryUrl: string,
  contractAddress: string,
): Promise<RegistryState> {
  const hex = await pollForState(queryUrl, contractAddress, 30, 1500);
  return decodeRegistryState(hex);
}

export async function tryFetchRegistryState(
  queryUrl: string,
  contractAddress: string,
): Promise<RegistryState | null> {
  try {
    const res = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query: `query LATEST_CONTRACT_STATE($address: HexEncoded!) {
          contractAction(address: $address) { state }
        }`,
        variables: { address: contractAddress },
      }),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    const state = payload.data?.contractAction?.state;
    if (!state) return null;
    return decodeRegistryState(state);
  } catch {
    return null;
  }
}
