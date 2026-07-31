/** Shared across deploy, CLI, tests, and browser — must stay in sync. */
export const ghostEconomyPrivateStateKey = 'ghostEconomyPrivateState' as const;
export type GhostEconomyPrivateStateId = typeof ghostEconomyPrivateStateKey;
