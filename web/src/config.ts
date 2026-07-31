import { setNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

/** Public app config — safe to commit (no secrets). Updated after preview deploy. */
export const APP_CONFIG = {
  networkId: 'preview' as const,
  contractAddress:
    '55de4ffd42d3e55924c40a46d55a3e69074a1282f2a0a8d072fec29e699bc0ec',
  indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  zkAssetPath: '/zk/ghost-economy',
} as const;

// Required before ledger decode, wallet connect, or any contract operation (preview network).
setNetworkId(APP_CONFIG.networkId as NetworkId);

export const NETWORK_ID = APP_CONFIG.networkId;
export const CONTRACT_ADDRESS = APP_CONFIG.contractAddress;
export const INDEXER_URL = APP_CONFIG.indexer;
export const ZK_ASSET_PATH = APP_CONFIG.zkAssetPath;
export const ZK_ASSET_ORIGIN =
  typeof window !== 'undefined'
    ? new URL(ZK_ASSET_PATH, window.location.origin).toString()
    : ZK_ASSET_PATH;
