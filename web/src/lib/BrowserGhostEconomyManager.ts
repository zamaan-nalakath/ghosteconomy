/**
 * Browser provider setup — mirrors darktalent BrowserDarkTalentManager.
 */
import {
  catchError,
  concatMap,
  filter,
  firstValueFrom,
  interval,
  map,
  take,
  throwError,
  timeout,
} from 'rxjs';
import { pipe as fnPipe } from 'fp-ts/function';
import semver from 'semver';
import type { Logger } from 'pino';
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import {
  Binding,
  type FinalizedTransaction,
  Proof,
  SignatureEnabled,
  Transaction,
  type TransactionId,
} from '@midnight-ntwrk/ledger-v8';
import { fromHex, toHex } from '@midnight-ntwrk/compact-runtime';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';

import {
  GhostEconomyAPI,
  type GhostEconomyCircuitKeys,
  type GhostEconomyProviders,
} from '../../../api/src/index.js';
import {
  createInitialPrivateState,
  type GhostEconomyPrivateState,
} from '@contracts/witnesses.js';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider.js';
import { NETWORK_ID, ZK_ASSET_ORIGIN } from '../config.js';

const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';
const SECRET_STORAGE_KEY = 'ghost-economy-secrets';
const INCOME_STORAGE_KEY = 'ghost-economy-income-draft';

export function getOrCreateSecrets(): GhostEconomyPrivateState {
  const stored = localStorage.getItem(SECRET_STORAGE_KEY);
  const incomeStored = localStorage.getItem(INCOME_STORAGE_KEY);
  let workerSecret: Uint8Array;
  if (stored) {
    const parsed = JSON.parse(stored) as { workerSecret: number[] };
    workerSecret = new Uint8Array(parsed.workerSecret);
  } else {
    workerSecret = crypto.getRandomValues(new Uint8Array(32));
    localStorage.setItem(
      SECRET_STORAGE_KEY,
      JSON.stringify({ workerSecret: Array.from(workerSecret) }),
    );
  }

  let monthlyIncomeCents: number[];
  if (incomeStored) {
    try {
      const parsed = JSON.parse(incomeStored) as number[];
      monthlyIncomeCents =
        Array.isArray(parsed) && parsed.length === 12
          ? parsed
          : Array.from({ length: 12 }, () => 320_000);
    } catch {
      monthlyIncomeCents = Array.from({ length: 12 }, () => 320_000);
    }
  } else {
    monthlyIncomeCents = Array.from({ length: 12 }, () => 320_000);
  }

  return createInitialPrivateState(workerSecret, monthlyIncomeCents);
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

export function updatePrivateStateIncome(monthlyIncomeCents: number[]): GhostEconomyPrivateState {
  const state = getOrCreateSecrets();
  saveIncomeDraft(monthlyIncomeCents);
  return createInitialPrivateState(state.workerSecret, monthlyIncomeCents);
}

const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  const midnight = (window as any).midnight;
  if (!midnight) return undefined;
  return Object.values(midnight).find(
    (wallet): wallet is InitialAPI =>
      !!wallet &&
      typeof wallet === 'object' &&
      'apiVersion' in wallet &&
      semver.satisfies(String((wallet as InitialAPI).apiVersion), COMPATIBLE_CONNECTOR_API_VERSION),
  );
};

const connectToWallet = (networkId: string): Promise<ConnectedAPI> =>
  firstValueFrom(
    fnPipe(
      interval(100),
      map(() => getFirstCompatibleWallet()),
      filter((api): api is InitialAPI => !!api),
      take(1),
      timeout({
        first: 5_000,
        with: () =>
          throwError(() => new Error('No Midnight wallet found. Install Lace or 1AM.')),
      }),
      concatMap(async (initialAPI) => initialAPI.connect(networkId)),
      timeout({
        first: 15_000,
        with: () => throwError(() => new Error('Wallet failed to connect.')),
      }),
      catchError((error) =>
        throwError(() => (error instanceof Error ? error : new Error('Wallet not authorized'))),
      ),
    ),
  );

async function initializeProviders(logger: Logger): Promise<{
  providers: GhostEconomyProviders;
  connectedAPI: ConnectedAPI;
  unshieldedAddress: string;
}> {
  setNetworkId(NETWORK_ID as NetworkId);

  const connectedAPI = await connectToWallet(NETWORK_ID);
  const config = await connectedAPI.getConfiguration();
  const proofServerUri = config.proverServerUri;
  if (!proofServerUri) {
    throw new Error('Wallet did not provide a proof server URI.');
  }

  logger.info({ proofServerUri, networkId: config.networkId }, 'Wallet configuration');

  const shieldedAddresses = await connectedAPI.getShieldedAddresses();
  const unshielded = await connectedAPI.getUnshieldedAddress();
  const zkConfigProvider = new FetchZkConfigProvider<GhostEconomyCircuitKeys>(
    ZK_ASSET_ORIGIN,
    fetch.bind(window),
  );

  const providers = {
    privateStateProvider: inMemoryPrivateStateProvider(),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(proofServerUri, zkConfigProvider),
    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
    walletProvider: {
      getCoinPublicKey: () => shieldedAddresses.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shieldedAddresses.shieldedEncryptionPublicKey,
      balanceTx: async (tx: UnboundTransaction): Promise<FinalizedTransaction> => {
        const received = await connectedAPI.balanceUnsealedTransaction(toHex(tx.serialize()));
        return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
          'signature',
          'proof',
          'binding',
          fromHex(received.tx),
        );
      },
    },
    midnightProvider: {
      submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        return tx.identifiers()[0];
      },
    },
  } as GhostEconomyProviders;

  return {
    providers,
    connectedAPI,
    unshieldedAddress: unshielded.unshieldedAddress,
  };
}

export class BrowserGhostEconomyManager {
  #providersPromise: ReturnType<typeof initializeProviders> | undefined;
  #apiPromise: Map<string, Promise<GhostEconomyAPI>> = new Map();

  constructor(private readonly logger: Logger) {}

  private getProviders() {
    return this.#providersPromise ?? (this.#providersPromise = initializeProviders(this.logger));
  }

  async join(contractAddress: string, privateState?: GhostEconomyPrivateState): Promise<GhostEconomyAPI> {
    const state = privateState ?? getOrCreateSecrets();
    const cacheKey = `${contractAddress}:${JSON.stringify(Array.from(state.workerSecret))}`;
    const existing = this.#apiPromise.get(cacheKey);
    if (existing) return existing;

    const promise = (async () => {
      const { providers } = await this.getProviders();
      return GhostEconomyAPI.join(providers, contractAddress, state);
    })();

    this.#apiPromise.set(cacheKey, promise);
    return promise;
  }

  async getSession(): Promise<{
    unshieldedAddress: string;
    connectedAPI: ConnectedAPI;
  }> {
    const session = await this.getProviders();
    return {
      unshieldedAddress: session.unshieldedAddress,
      connectedAPI: session.connectedAPI,
    };
  }

  async disconnect(): Promise<void> {
    const session = await this.#providersPromise;
    if (session) {
      await (session.connectedAPI as { disconnect?: () => Promise<void> }).disconnect?.();
    }
    this.#providersPromise = undefined;
    this.#apiPromise.clear();
  }
}

export function friendlyError(error: unknown): string {
  const msg = extractErrorMessage(error);
  if (msg.includes('User rejected')) return 'You cancelled in the wallet. No problem — try again when ready.';
  if (msg.includes('profile already registered')) {
    return 'This income pattern already has a badge. Change your months or floor and try again.';
  }
  if (msg.includes('insufficient income consistency')) {
    return 'Not enough consecutive months at that floor yet. Lower the floor or add steadier months.';
  }
  if (msg.includes('No private state found')) {
    return 'Something reset on this device. Connect again, then retry.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('Failed Proof Server')) {
    return 'Couldn’t reach the proof service. Check your wallet network and try again.';
  }
  if (msg.includes('No Midnight wallet')) {
    return 'No Midnight wallet found. Install Lace or 1AM, then try Connect again.';
  }
  if (msg.includes('not authorized')) return 'Wallet connection was declined.';
  if (msg.includes('insufficient') || msg.includes('DUST')) {
    return 'Your wallet needs a little more balance. Fund it from the network faucet, then retry.';
  }
  // Avoid dumping raw stacks / hex at consumers
  if (msg.length > 180 || msg.includes('at ') || msg.includes('0x')) {
    return 'Something went wrong. Try again in a moment — or reconnect your wallet.';
  }
  return msg || 'Something went wrong. Try again in a moment.';
}

function extractErrorMessage(error: unknown): string {
  if (!error) return '';
  if (error instanceof Error && error.message) return error.message;
  const e = error as { cause?: { failure?: { message?: string; cause?: { message?: string } }; message?: string } };
  if (e.cause?.failure?.message) return e.cause.failure.message;
  if (e.cause?.failure?.cause?.message) return e.cause.failure.cause.message;
  if (e.cause?.message) return e.cause.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
