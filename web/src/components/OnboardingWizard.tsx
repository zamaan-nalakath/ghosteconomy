import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Briefcase, EyeSlash, Medal } from '@phosphor-icons/react';
import { useProgress } from './ProgressProvider';
import type { PathChoice } from '../lib/progress';

type Props = {
  onComplete: () => void;
};

const STEPS = [
  {
    id: 'what',
    icon: Briefcase,
    title: 'What Ghost Economy is',
    body: 'A night-city income passport on Midnight. Prove you cleared a floor for consecutive months — lenders see a tier, not your receipts.',
  },
  {
    id: 'private',
    icon: EyeSlash,
    title: 'What stays private',
    body: 'Twelve monthly totals, platform names, and tips stay in this browser. The public board shows only a coarse badge and consistency count.',
  },
  {
    id: 'do',
    icon: Medal,
    title: 'What you’ll do',
    body: 'Connect once, enter your months privately, pick a floor, and earn a Bronze, Silver, or Gold badge — without opening the books.',
  },
] as const;

export function OnboardingWizard({ onComplete }: Props) {
  const { completeOnboarding, state } = useProgress();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(
    state.displayName === 'Anonymous earner' ? '' : state.displayName,
  );
  const [path, setPath] = useState<PathChoice>(state.path ?? 'worker');
  const reduce = useReducedMotion();
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  function finish() {
    completeOnboarding(name.trim() || 'Anonymous earner', path ?? 'worker');
    onComplete();
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 md:px-8 md:py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
        Orientation · {String(step + 1).padStart(2, '0')} / 03
      </p>

      <motion.div
        key={current.id}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8"
      >
        <current.icon size={36} weight="duotone" className="text-accent" />
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          {current.title}
        </h1>
        <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-mist">{current.body}</p>
      </motion.div>

      {last ? (
        <>
          <div className="mt-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
              Which path fits you? (soft choice — you can explore both)
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    id: 'worker' as const,
                    title: 'Worker',
                    body: 'Prove income and earn a public badge.',
                  },
                  {
                    id: 'lender' as const,
                    title: 'Lender',
                    body: 'Check eligibility signals on the board.',
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPath(option.id)}
                  className={`border px-4 py-4 text-left transition active:scale-[0.99] ${
                    path === option.id
                      ? 'border-accent bg-accent/10 text-paper'
                      : 'border-line bg-ink-elevated text-paper hover:border-mist'
                  }`}
                >
                  <span className="font-display text-lg font-bold">{option.title}</span>
                  <span className="mt-2 block text-sm text-mist">{option.body}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="mt-8 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
              Display name (local only)
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Anonymous earner"
              maxLength={40}
              className="mt-2 w-full border border-line bg-ink px-4 py-3 text-sm text-paper outline-none transition focus:border-accent"
            />
            <span className="mt-2 block text-xs text-mist">
              Stored in this browser. Never sent to the ledger.
            </span>
          </label>
        </>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex items-center gap-2 border border-line px-4 py-2.5 text-sm text-paper transition hover:border-mist active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        ) : null}
        {!last ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-accent-dim active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={14} weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-accent-dim active:scale-[0.98]"
          >
            Enter Ghost Economy
            <ArrowRight size={14} weight="bold" />
          </button>
        )}
      </div>

      <div className="mt-12 flex gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`h-1 flex-1 transition ${i <= step ? 'bg-accent' : 'bg-line'}`}
          />
        ))}
      </div>
    </div>
  );
}
