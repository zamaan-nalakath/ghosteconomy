import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { ghostEconomyPrivateStateKey } from '../../contracts/constants.js';
import type { GhostEconomyPrivateState } from '../../contracts/witnesses.js';

export { ghostEconomyPrivateStateKey };

export type GhostEconomyCircuitKeys = 'registerIncomeProfile';
export type GhostEconomyProviders = MidnightProviders<
  GhostEconomyCircuitKeys,
  typeof ghostEconomyPrivateStateKey,
  GhostEconomyPrivateState
>;
export type DeployedGhostEconomyContract = FoundContract<any>;

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

export const TIER_LABELS = ['Unverified', 'Bronze', 'Silver', 'Gold'] as const;

export function incomeTierLabel(tier: number): string {
  return TIER_LABELS[tier] ?? `Tier ${tier}`;
}
