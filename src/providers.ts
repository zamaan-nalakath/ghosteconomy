import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type MidnightWalletProvider } from './wallet.js';
import { type NetworkConfig } from './config.js';

export type GhostEconomyCircuits = 'registerIncomeProfile';

export type GhostEconomyProviders = MidnightProviders<GhostEconomyCircuits>;

export function buildProviders(
  wallet: MidnightWalletProvider,
  zkConfigPath: string,
  config: NetworkConfig,
  storeSuffix = `${Date.now()}`,
): GhostEconomyProviders {
  const zkConfigProvider = new NodeZkConfigProvider<GhostEconomyCircuits>(
    zkConfigPath,
  );

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: `ghost-economy-${storeSuffix}`,
      walletProvider: wallet,
      privateStoragePasswordProvider: () => 'xK9#mQ2$pL8@nR5!vW3*',
      accountId: `ge-account-${storeSuffix}`,
    }),
    publicDataProvider: indexerPublicDataProvider(
      config.indexer,
      config.indexerWS,
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(
      config.proofServer,
      zkConfigProvider,
    ),
    walletProvider: wallet,
    midnightProvider: wallet,
  };
}
