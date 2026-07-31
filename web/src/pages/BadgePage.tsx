import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Medal } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';

type LocationState = { tier?: 'Bronze' | 'Silver' | 'Gold' | 'Unverified' };

const TIER_COPY: Record<string, { headline: string; blurb: string }> = {
  Gold: {
    headline: 'Gold badge unlocked',
    blurb: 'Twelve months of consistency at your floor. Top signal on the night-city board.',
  },
  Silver: {
    headline: 'Silver badge unlocked',
    blurb: 'Six steady months above your floor. Lenders see real habit forming.',
  },
  Bronze: {
    headline: 'Bronze badge unlocked',
    blurb: 'Three consecutive months cleared. Your standing is on the board — amounts stayed private.',
  },
  Unverified: {
    headline: 'Standing updated',
    blurb: 'Your prove landed, but tier thresholds need more consecutive months at the floor.',
  },
};

function tierStyles(tier: string) {
  switch (tier) {
    case 'Gold':
      return 'border-accent bg-accent/15 text-accent';
    case 'Silver':
      return 'border-mist/50 bg-ink-elevated text-paper';
    case 'Bronze':
      return 'border-accent-dim/60 bg-accent/5 text-accent-dim';
    default:
      return 'border-line bg-ink text-mist';
  }
}

export function BadgePage() {
  const reduce = useReducedMotion();
  const location = useLocation();
  const { state } = useProgress();
  const navTier = (location.state as LocationState | null)?.tier;
  const tier = navTier ?? state.lastTier ?? 'Bronze';
  const copy = TIER_COPY[tier] ?? TIER_COPY.Bronze;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-16 md:px-8 md:py-24">
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="border border-line bg-ink-elevated p-8 text-center md:p-12"
      >
        <Medal
          size={72}
          weight="duotone"
          className={`mx-auto anim-medal-unlock ${tier === 'Gold' ? 'text-accent' : tier === 'Silver' ? 'text-paper' : 'text-accent-dim'}`}
        />
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Badge reveal</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          {copy.headline}
        </h1>
        <p
          className={`mx-auto mt-6 inline-block border px-4 py-2 font-display text-2xl font-bold ${tierStyles(tier)}`}
        >
          {tier}
        </p>
        <p className="mx-auto mt-6 max-w-[40ch] text-sm leading-relaxed text-mist">{copy.blurb}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/registry"
            className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-accent-dim active:scale-[0.98]"
          >
            See public board
            <ArrowRight size={14} weight="bold" />
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 border border-line px-5 py-3 text-sm text-paper transition hover:border-mist active:scale-[0.98]"
          >
            Back home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
