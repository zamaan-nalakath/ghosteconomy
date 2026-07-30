import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { witnesses } from '@contracts/witnesses.js';

export {
  Contract,
  ledger,
  pureCircuits,
} from '@contracts/managed/ghost-economy/contract/index.js';
import { Contract } from '@contracts/managed/ghost-economy/contract/index.js';

export const ZK_ASSET_PATH = '/zk/ghost-economy';

export const CompiledGhostEconomyContract = CompiledContract.make(
  'GhostEconomyContract',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(ZK_ASSET_PATH),
);
