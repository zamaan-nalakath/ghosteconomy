import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { witnesses } from './witnesses.js';
import { Contract } from './managed/ghost-economy/contract/index.js';

/** Browser — relative asset path resolved by FetchZkConfigProvider. */
export const CompiledGhostEconomyContract = CompiledContract.make(
  'GhostEconomyContract',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets('./managed/ghost-economy'),
);

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/ghost-economy/contract/index.js';
