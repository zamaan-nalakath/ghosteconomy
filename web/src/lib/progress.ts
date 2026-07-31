/**
 * Local Ghost standing — retention loops without leaking income on-chain.
 * Wallet link stays private; this is browser-local reputation.
 */

export type GhostRankId = 'ghost' | 'earner' | 'steady' | 'trusted' | 'gold_standard';

export type PathChoice = 'worker' | 'lender' | null;

export type AchievementId =
  | 'first_steps'
  | 'first_prove'
  | 'tier_bronze'
  | 'tier_silver'
  | 'tier_gold'
  | 'lender_check'
  | 'streak_3'
  | 'streak_7'
  | 'return_visit';

export type HistoryEvent = {
  id: string;
  at: number;
  kind:
    | 'onboarded'
    | 'connected'
    | 'prove'
    | 'badge'
    | 'lender'
    | 'visit'
    | 'achievement';
  label: string;
  detail?: string;
};

export type ProgressState = {
  displayName: string;
  path: PathChoice;
  onboarded: boolean;
  xp: number;
  streak: number;
  lastVisitDay: string | null;
  provesCompleted: number;
  lenderChecks: number;
  lastTier: 'Bronze' | 'Silver' | 'Gold' | null;
  achievements: AchievementId[];
  history: HistoryEvent[];
  compactMode: boolean;
  showAdvanced: boolean;
};

const STORAGE_KEY = 'ghost-economy-progress-v1';

export const RANKS: {
  id: GhostRankId;
  label: string;
  minXp: number;
  blurb: string;
}[] = [
  { id: 'ghost', label: 'Ghost', minXp: 0, blurb: 'Still in the night city. No badge yet.' },
  { id: 'earner', label: 'Earner', minXp: 20, blurb: 'You showed up. Standing begins.' },
  { id: 'steady', label: 'Steady', minXp: 60, blurb: 'An income badge is on the board.' },
  { id: 'trusted', label: 'Trusted', minXp: 120, blurb: 'Habit forming. Lenders can see the signal.' },
  { id: 'gold_standard', label: 'Gold standard', minXp: 220, blurb: 'Top-tier consistency. Night-city regular.' },
];

export const ACHIEVEMENTS: {
  id: AchievementId;
  title: string;
  blurb: string;
  xp: number;
}[] = [
  { id: 'first_steps', title: 'First light', blurb: 'Finished orientation.', xp: 15 },
  { id: 'first_prove', title: 'Books sealed', blurb: 'Proved income without opening the books.', xp: 40 },
  { id: 'tier_bronze', title: 'Bronze badge', blurb: 'Three steady months at your floor.', xp: 20 },
  { id: 'tier_silver', title: 'Silver badge', blurb: 'Six months of consistency.', xp: 30 },
  { id: 'tier_gold', title: 'Gold badge', blurb: 'Twelve months. Full climb.', xp: 45 },
  { id: 'lender_check', title: 'Lender desk', blurb: 'Ran an eligibility check.', xp: 25 },
  { id: 'streak_3', title: 'Three-day return', blurb: 'Came back three days in a row.', xp: 25 },
  { id: 'streak_7', title: 'Week on the beat', blurb: 'Seven-day return streak.', xp: 50 },
  { id: 'return_visit', title: 'Came back', blurb: 'Returned after earning a badge.', xp: 15 },
];

const defaultState = (): ProgressState => ({
  displayName: 'Anonymous earner',
  path: null,
  onboarded: false,
  xp: 0,
  streak: 0,
  lastVisitDay: null,
  provesCompleted: 0,
  lenderChecks: 0,
  lastTier: null,
  achievements: [],
  history: [],
  compactMode: false,
  showAdvanced: false,
});

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a);
  return Math.round(ms / 86_400_000);
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return { ...defaultState(), ...parsed, history: parsed.history?.slice(0, 40) ?? [] };
  } catch {
    return defaultState();
  }
}

export function saveProgress(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function rankForXp(xp: number) {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) current = rank;
  }
  const idx = RANKS.findIndex((r) => r.id === current.id);
  const next = RANKS[idx + 1] ?? null;
  const span = next ? next.minXp - current.minXp : 1;
  const into = next ? xp - current.minXp : span;
  const progress = next ? Math.min(1, into / span) : 1;
  return { current, next, progress };
}

function pushHistory(
  state: ProgressState,
  kind: HistoryEvent['kind'],
  label: string,
  detail?: string,
): ProgressState {
  const event: HistoryEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    kind,
    label,
    detail,
  };
  return { ...state, history: [event, ...state.history].slice(0, 40) };
}

function unlock(state: ProgressState, id: AchievementId): ProgressState {
  if (state.achievements.includes(id)) return state;
  const meta = ACHIEVEMENTS.find((a) => a.id === id);
  if (!meta) return state;
  let next = {
    ...state,
    achievements: [...state.achievements, id],
    xp: state.xp + meta.xp,
  };
  next = pushHistory(next, 'achievement', meta.title, meta.blurb);
  return next;
}

export function recordVisit(state: ProgressState): ProgressState {
  const today = todayKey();
  if (state.lastVisitDay === today) return state;

  let streak = 1;
  if (state.lastVisitDay) {
    const diff = dayDiff(state.lastVisitDay, today);
    streak = diff === 1 ? state.streak + 1 : 1;
  }

  let next: ProgressState = {
    ...state,
    streak,
    lastVisitDay: today,
    xp: state.xp + 2,
  };
  next = pushHistory(next, 'visit', 'Returned to Ghost Economy', `Day streak: ${streak}`);

  if (streak >= 3) next = unlock(next, 'streak_3');
  if (streak >= 7) next = unlock(next, 'streak_7');
  if (state.provesCompleted > 0) next = unlock(next, 'return_visit');

  return next;
}

export function completeOnboarding(
  state: ProgressState,
  displayName: string,
  path: PathChoice = 'worker',
): ProgressState {
  let next: ProgressState = {
    ...state,
    displayName: displayName.trim() || state.displayName,
    path: path ?? 'worker',
    onboarded: true,
    xp: state.xp + 10,
  };
  next = pushHistory(
    next,
    'onboarded',
    'Orientation complete',
    `${next.displayName} · ${next.path === 'lender' ? 'Lender path' : 'Worker path'}`,
  );
  next = unlock(next, 'first_steps');
  return next;
}

export function recordConnect(state: ProgressState): ProgressState {
  let next = { ...state, xp: state.xp + 8 };
  next = pushHistory(next, 'connected', 'Wallet linked', 'Ready to prove');
  return next;
}

export function recordProve(
  state: ProgressState,
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Unverified',
): ProgressState {
  let next: ProgressState = {
    ...state,
    provesCompleted: state.provesCompleted + 1,
    lastTier: tier === 'Unverified' ? state.lastTier : tier,
    xp: state.xp + 30,
  };
  next = pushHistory(
    next,
    'prove',
    'Income proved privately',
    tier === 'Unverified' ? 'Standing updated' : `${tier} badge`,
  );
  next = unlock(next, 'first_prove');
  if (tier === 'Bronze' || tier === 'Silver' || tier === 'Gold') {
    next = pushHistory(next, 'badge', `${tier} badge earned`, 'Published without opening the books');
  }
  if (tier === 'Bronze') next = unlock(next, 'tier_bronze');
  if (tier === 'Silver') {
    next = unlock(next, 'tier_bronze');
    next = unlock(next, 'tier_silver');
  }
  if (tier === 'Gold') {
    next = unlock(next, 'tier_bronze');
    next = unlock(next, 'tier_silver');
    next = unlock(next, 'tier_gold');
  }
  return next;
}

export function recordLenderCheck(state: ProgressState): ProgressState {
  let next: ProgressState = {
    ...state,
    lenderChecks: state.lenderChecks + 1,
    xp: state.xp + 12,
  };
  next = pushHistory(next, 'lender', 'Eligibility check', 'Lender desk visit');
  next = unlock(next, 'lender_check');
  return next;
}

export function updateSettings(
  state: ProgressState,
  patch: Partial<Pick<ProgressState, 'displayName' | 'compactMode' | 'showAdvanced' | 'path'>>,
): ProgressState {
  return { ...state, ...patch };
}

export function resetProgress(): ProgressState {
  const fresh = defaultState();
  saveProgress(fresh);
  return fresh;
}
