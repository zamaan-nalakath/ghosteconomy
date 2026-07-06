import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { witnesses } from './witnesses.js';

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/ghost-economy/contract/index.js';
import { Contract } from './managed/ghost-economy/contract/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const zkConfigPath = path.resolve(currentDir, 'managed', 'ghost-economy');

export const CompiledGhostEconomyContract = CompiledContract.make(
  'GhostEconomyContract',
  Contract,
).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);
