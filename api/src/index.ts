/**
 * Shared Ghost Economy contract API — browser (1AM / Lace) and CLI.
 */
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  ContractState,
  fromHex,
  type ContractAddress,
} from '@midnight-ntwrk/compact-runtime';

import {
  CompiledGhostEconomyContract,
  ledger,
  pureCircuits,
} from '../../contracts/compiled.js';
import type { GhostEconomyPrivateState } from '../../contracts/witnesses.js';
import {
  ghostEconomyPrivateStateKey,
  incomeTierLabel,
  type GhostEconomyProviders,
  type DeployedGhostEconomyContract,
  type ProfileRegistryEntry,
  type RegistryState,
} from './common-types.js';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class GhostEconomyAPI {
  readonly contractAddress: ContractAddress;

  private constructor(
    private readonly deployedContract: DeployedGhostEconomyContract,
    private readonly providers: GhostEconomyProviders,
  ) {
    this.contractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.contractAddress);
  }

  async registerIncomeProfile(
    minMonthlyCents: number,
    requiredMonths: number,
  ): Promise<void> {
    if (minMonthlyCents < 0) {
      throw new Error('minMonthlyCents must be non-negative');
    }
    if (requiredMonths < 1 || requiredMonths > 12) {
      throw new Error('requiredMonths must be 1-12');
    }
    await (this.deployedContract as any).callTx.registerIncomeProfile(
      BigInt(minMonthlyCents),
      BigInt(requiredMonths),
    );
  }

  static decodeRegistryState(stateHex: string, networkId?: NetworkId): RegistryState {
    if (networkId !== undefined) {
      setNetworkId(networkId);
    }
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

  static async fetchRegistryState(
    queryUrl: string,
    contractAddress: string,
    networkId?: NetworkId,
  ): Promise<RegistryState> {
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
    if (!res.ok) throw new Error(`Indexer HTTP error: ${res.status}`);
    const payload = await res.json();
    if (payload.errors?.length) {
      throw new Error(payload.errors.map((e: { message: string }) => e.message).join('; '));
    }
    const hex = payload.data?.contractAction?.state ?? null;
    if (!hex) return { profileCount: 0, entries: [] };
    return GhostEconomyAPI.decodeRegistryState(hex, networkId);
  }

  static commitmentPreviews(privateState: GhostEconomyPrivateState) {
    return {
      profile: bytesToHex(pureCircuits.profileCommitment(privateState.monthlyIncomeCents)),
      worker: bytesToHex(pureCircuits.workerCommitment(privateState.workerSecret)),
    };
  }

  static async deploy(
    providers: GhostEconomyProviders,
    privateState: GhostEconomyPrivateState,
  ): Promise<GhostEconomyAPI> {
    const deployedContract = await (deployContract as any)(providers, {
      compiledContract: CompiledGhostEconomyContract,
      privateStateId: ghostEconomyPrivateStateKey,
      initialPrivateState: privateState,
      args: [],
    });
    return new GhostEconomyAPI(deployedContract, providers);
  }

  static async join(
    providers: GhostEconomyProviders,
    contractAddress: ContractAddress,
    privateState: GhostEconomyPrivateState,
    compiledContract: typeof CompiledGhostEconomyContract = CompiledGhostEconomyContract,
  ): Promise<GhostEconomyAPI> {
    const deployedContract = await findDeployedContract(providers as any, {
      contractAddress,
      compiledContract,
      privateStateId: ghostEconomyPrivateStateKey,
      initialPrivateState: privateState,
    });
    return new GhostEconomyAPI(deployedContract, providers);
  }
}

export * from './common-types.js';
