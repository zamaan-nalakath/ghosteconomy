/** Client-side tier prediction matching ghost-economy.compact computeTier / maxConsecutiveMonths. */

export type TierLabel = 'Unverified' | 'Bronze' | 'Silver' | 'Gold';

export function maxConsecutiveMonths(incomesCents: number[], floorCents: number): number {
  let streak = 0;
  let max = 0;
  for (const cents of incomesCents) {
    if (cents >= floorCents) {
      streak += 1;
      if (streak > max) max = streak;
    } else {
      streak = 0;
    }
  }
  return max;
}

export function computeTier(consecutiveMonths: number): TierLabel {
  if (consecutiveMonths >= 12) return 'Gold';
  if (consecutiveMonths >= 6) return 'Silver';
  if (consecutiveMonths >= 3) return 'Bronze';
  return 'Unverified';
}

export function predictTier(
  incomesCents: number[],
  floorCents: number,
): { consistencyMonths: number; tier: TierLabel; meetsRequired: (required: number) => boolean } {
  const consistencyMonths = maxConsecutiveMonths(incomesCents, floorCents);
  return {
    consistencyMonths,
    tier: computeTier(consistencyMonths),
    meetsRequired: (required) => consistencyMonths >= required,
  };
}

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function dollarsToCents(dollars: number): number {
  return Math.max(0, Math.round(dollars * 100));
}

export function centsToDollarsInput(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
