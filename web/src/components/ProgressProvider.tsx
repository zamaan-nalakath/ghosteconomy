import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  completeOnboarding,
  loadProgress,
  rankForXp,
  recordConnect,
  recordLenderCheck,
  recordProve,
  recordVisit,
  resetProgress,
  saveProgress,
  updateSettings,
  type PathChoice,
  type ProgressState,
} from '../lib/progress';

type ProgressContextValue = {
  state: ProgressState;
  rank: ReturnType<typeof rankForXp>;
  completeOnboarding: (displayName: string, path?: PathChoice) => void;
  recordConnect: () => void;
  recordProve: (tier: 'Bronze' | 'Silver' | 'Gold' | 'Unverified') => void;
  recordLenderCheck: () => void;
  updateSettings: (
    patch: Partial<Pick<ProgressState, 'displayName' | 'compactMode' | 'showAdvanced' | 'path'>>,
  ) => void;
  resetLocalData: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => loadProgress());

  useEffect(() => {
    setState((prev) => {
      const next = recordVisit(prev);
      if (next !== prev) saveProgress(next);
      return next;
    });
  }, []);

  useEffect(() => {
    saveProgress(state);
  }, [state]);

  const mutate = useCallback((fn: (s: ProgressState) => ProgressState) => {
    setState((prev) => fn(prev));
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      rank: rankForXp(state.xp),
      completeOnboarding: (displayName, path) =>
        mutate((s) => completeOnboarding(s, displayName, path)),
      recordConnect: () => mutate((s) => recordConnect(s)),
      recordProve: (tier) => mutate((s) => recordProve(s, tier)),
      recordLenderCheck: () => mutate((s) => recordLenderCheck(s)),
      updateSettings: (patch) => mutate((s) => updateSettings(s, patch)),
      resetLocalData: () => setState(resetProgress()),
    }),
    [state, mutate],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
