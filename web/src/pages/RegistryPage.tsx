import type { RegistryState } from '../../../api/src/index.js';
import { AdvancedDetails } from '../components/AdvancedDetails';
import { useProgress } from '../components/ProgressProvider';
import { CONTRACT_ADDRESS } from '../config';

type Props = {
  registry: RegistryState | null;
  busy: boolean;
  onRefresh: () => void;
};

function tierBadgeClass(tier: string) {
  switch (tier) {
    case 'Gold':
      return 'border-accent/50 bg-accent/15 text-accent';
    case 'Silver':
      return 'border-mist/40 bg-ink text-paper';
    case 'Bronze':
      return 'border-accent-dim/50 bg-accent/5 text-accent-dim';
    default:
      return 'border-line bg-ink text-mist';
  }
}

export function RegistryPage({ registry, busy, onRefresh }: Props) {
  const { state } = useProgress();

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Public board</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Badge registry</h1>
          <p className="mt-4 max-w-[52ch] text-mist">
            Tier badges and consistency counts only. Raw dollar amounts never appear here.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={onRefresh}
          className="border border-line px-4 py-2.5 text-sm text-paper transition hover:border-mist disabled:opacity-50 active:scale-[0.98]"
        >
          Refresh
        </button>
      </div>

      {!registry || registry.entries.length === 0 ? (
        <section className="mt-10 border border-line bg-ink-elevated p-8">
          <p className="text-mist">No public badges yet. Be the first to prove from Prove.</p>
        </section>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {registry.entries.map((entry, i) => (
            <article
              key={entry.profileCommitment}
              className="border border-line bg-ink-elevated p-5 transition hover:border-mist/40"
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-block border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] ${tierBadgeClass(entry.tierLabel)}`}
                >
                  {entry.tierLabel}
                </span>
                <span className="font-mono text-[11px] text-mist">#{i + 1}</span>
              </div>
              <p className="mt-5 font-display text-3xl font-extrabold text-paper">
                {entry.consistencyMonths}
                <span className="ml-2 text-base font-normal text-mist">months</span>
              </p>
              <p className="mt-2 text-xs text-mist">Consecutive months above their chosen floor</p>
              {state.showAdvanced ? (
                <div className="mt-4 space-y-1 font-mono text-[10px] text-mist break-all">
                  <p title={entry.profileCommitment}>profile: {entry.profileCommitment.slice(0, 18)}…</p>
                  <p title={entry.workerCommitment}>worker: {entry.workerCommitment.slice(0, 18)}…</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {registry ? (
        <p className="mt-6 font-mono text-[11px] text-mist">
          {registry.profileCount} badge{registry.profileCount === 1 ? '' : 's'} registered
        </p>
      ) : null}

      <AdvancedDetails label="Contract address">
        <p>{CONTRACT_ADDRESS}</p>
      </AdvancedDetails>
    </div>
  );
}
