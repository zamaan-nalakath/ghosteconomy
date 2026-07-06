import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';

export type GhostEconomyPrivateState = {
  workerSecret: Uint8Array;
  monthlyIncomeCents: bigint[];
};

export const witnesses = {
  workerSecret: (context: WitnessContext<GhostEconomyPrivateState>) =>
    [context.privateState, context.privateState.workerSecret] as const,
  monthlyIncomeCents: (context: WitnessContext<GhostEconomyPrivateState>) =>
    [context.privateState, context.privateState.monthlyIncomeCents] as const,
};

export function createInitialPrivateState(
  workerSecret: Uint8Array,
  monthlyIncomeCents: bigint[] | number[],
): GhostEconomyPrivateState {
  if (monthlyIncomeCents.length !== 12) {
    throw new Error('monthlyIncomeCents must have exactly 12 entries');
  }
  return {
    workerSecret,
    monthlyIncomeCents: monthlyIncomeCents.map((v) => BigInt(v)),
  };
}

export function uniformMonthlyIncome(monthlyCents: number): bigint[] {
  return Array.from({ length: 12 }, () => BigInt(monthlyCents));
}
