import { Navigate, useLocation } from 'react-router-dom';
import { useProgress } from './ProgressProvider';
import type { ReactNode } from 'react';

/** Gate first core actions until orientation is complete. */
export function RequireOnboarded({ children }: { children: ReactNode }) {
  const { state } = useProgress();
  const location = useLocation();

  if (!state.onboarded) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
