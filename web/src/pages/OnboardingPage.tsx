import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { OnboardingWizard } from '../components/OnboardingWizard';
import { useProgress } from '../components/ProgressProvider';

export function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useProgress();
  const from = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (state.onboarded) {
      navigate(from && from !== '/onboarding' ? from : '/home', { replace: true });
    }
  }, [state.onboarded, from, navigate]);

  return (
    <OnboardingWizard
      onComplete={() => navigate(from && from !== '/onboarding' ? from : '/home', { replace: true })}
    />
  );
}
