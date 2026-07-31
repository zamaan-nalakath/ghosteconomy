import { Link } from 'react-router-dom';
import { Trophy } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';
import { ACHIEVEMENTS } from '../lib/progress';

export function ProfilePage() {
  const { state, rank } = useProgress();

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Profile</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
            {state.displayName}
          </h1>
          <p className="mt-3 text-mist">
            {rank.current.label} · {state.xp} XP · {state.streak}-day streak
            {state.path ? ` · ${state.path === 'lender' ? 'Lender' : 'Worker'} path` : ''}
          </p>
        </div>
        <Link
          to="/settings"
          className="border border-line px-4 py-2 text-sm text-paper transition hover:border-mist"
        >
          Settings
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Badges earned', value: state.provesCompleted },
          { label: 'Last tier', value: state.lastTier ?? '—' },
          { label: 'Lender checks', value: state.lenderChecks },
          { label: 'Achievements', value: state.achievements.length },
        ].map((stat) => (
          <div key={stat.label} className="border border-line bg-ink-elevated p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold text-accent">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <div className="flex items-center gap-2">
          <Trophy size={22} weight="duotone" className="text-accent" />
          <h2 className="font-display text-2xl font-bold">Achievements</h2>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = state.achievements.includes(ach.id);
            return (
              <li
                key={ach.id}
                className={`border p-5 ${
                  unlocked ? 'border-accent/35 bg-ink-elevated' : 'border-line bg-ink opacity-55'
                }`}
              >
                <p className="font-display text-lg font-bold">{ach.title}</p>
                <p className="mt-2 text-sm text-mist">{ach.blurb}</p>
                <p className="mt-3 font-mono text-[11px] text-mist">
                  {unlocked ? 'Unlocked' : 'Locked'} · +{ach.xp} XP
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
