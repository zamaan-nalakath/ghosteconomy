import { useProgress } from '../components/ProgressProvider';

function formatWhen(at: number) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(at));
  } catch {
    return new Date(at).toLocaleString();
  }
}

export function ActivityPage() {
  const { state } = useProgress();

  return (
    <div className="mx-auto max-w-[800px] px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Activity</h1>
      <p className="mt-3 text-mist">Your local earner log — nothing here is published on-chain.</p>

      {state.history.length === 0 ? (
        <p className="mt-12 text-sm text-mist">No events yet. Prove income to begin.</p>
      ) : (
        <ul className="mt-10 divide-y divide-line border border-line bg-ink-elevated">
          {state.history.map((event) => (
            <li key={event.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-paper">{event.label}</p>
                {event.detail ? (
                  <p className="mt-1 text-xs text-mist">{event.detail}</p>
                ) : null}
              </div>
              <time className="font-mono text-[11px] text-mist">{formatWhen(event.at)}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
