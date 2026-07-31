import { Link } from 'react-router-dom';
import { ArrowRight, Fire, Medal, Scales } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';

type Props = {
  connected: boolean;
  badgeCount: number | null;
  onOpenConnect: () => void;
};

export function HomePage({ connected, badgeCount, onOpenConnect }: Props) {
  const { state, rank } = useProgress();
  const pct = Math.round(rank.progress * 100);

  const hasBadge = state.provesCompleted > 0 && Boolean(state.lastTier);
  const isLender = state.path === 'lender';

  let nextTitle = 'Prove your income';
  let nextBody =
    'Enter twelve private months, pick a floor, and earn a public badge — dollar amounts stay off-chain.';
  let nextPrimary = { to: '/prove', label: 'Start proving' };
  let nextSecondary = { to: '/registry', label: 'See the board' };

  if (hasBadge) {
    nextTitle = 'Badge on the board';
    nextBody = `Your ${state.lastTier} badge is live. Return to prove again or browse what lenders see publicly.`;
    nextPrimary = { to: '/badge', label: 'View your badge' };
    nextSecondary = { to: '/registry', label: 'Public board' };
  } else if (isLender) {
    nextTitle = 'Check eligibility';
    nextBody =
      'Browse tier badges on the public board. Full lender credential checks arrive in the next update.';
    nextPrimary = { to: '/lend', label: 'Lender desk' };
    nextSecondary = { to: '/registry', label: 'Browse board' };
  } else if (state.provesCompleted > 0) {
    nextTitle = 'Try again for a tier';
    nextBody = 'Adjust your floor or months, then prove again for Bronze, Silver, or Gold.';
    nextPrimary = { to: '/prove', label: 'Prove again' };
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Your standing</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
        {state.displayName}
      </h1>
      <p className="mt-3 max-w-[48ch] text-mist">{rank.current.blurb}</p>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="border border-line bg-ink-elevated p-5 md:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">Rank</p>
              <p className="mt-1 font-display text-2xl font-bold text-accent">{rank.current.label}</p>
            </div>
            <p className="font-mono text-sm text-mist">{state.xp} XP</p>
          </div>
          <div className="mt-5 h-2 w-full bg-ink-soft">
            <div
              className="h-full bg-accent transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[11px] text-mist">
            {rank.next
              ? `${rank.next.minXp - state.xp} XP to ${rank.next.label}`
              : 'Top of the night city'}
          </p>
        </div>

        <div className="border border-line bg-ink-elevated p-5">
          <div className="flex items-center gap-2 text-accent">
            <Fire size={20} weight="duotone" />
            <p className="font-mono text-[11px] uppercase tracking-[0.14em]">Streak</p>
          </div>
          <p className="mt-3 font-display text-4xl font-extrabold">
            {state.streak}
            <span className="ml-2 text-lg text-mist">day{state.streak === 1 ? '' : 's'}</span>
          </p>
          <p className="mt-2 text-xs text-mist">Return tomorrow to keep cadence.</p>
        </div>
      </div>

      <section className="mt-12 border border-accent/30 bg-ink-elevated p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Next action</p>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">{nextTitle}</h2>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-mist">{nextBody}</p>
            {badgeCount != null ? (
              <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-mist">
                <Medal size={14} className="text-accent" />
                {badgeCount} badge{badgeCount === 1 ? '' : 's'} on the public board
              </p>
            ) : null}
            {state.path ? (
              <p className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-mist">
                <Scales size={14} className="text-accent" />
                {state.path === 'lender' ? 'Lender path' : 'Worker path'}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {!connected && nextPrimary.to === '/prove' ? (
              <button
                type="button"
                onClick={onOpenConnect}
                className="inline-flex items-center gap-2 border border-line px-4 py-2.5 text-sm text-paper transition hover:border-mist active:scale-[0.98]"
              >
                Connect first
              </button>
            ) : null}
            <Link
              to={nextPrimary.to}
              className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-accent-dim active:scale-[0.98]"
            >
              {nextPrimary.label}
              <ArrowRight size={14} weight="bold" />
            </Link>
            <Link
              to={nextSecondary.to}
              className="inline-flex items-center gap-2 border border-line px-4 py-2.5 text-sm text-paper transition hover:border-mist active:scale-[0.98]"
            >
              {nextSecondary.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
