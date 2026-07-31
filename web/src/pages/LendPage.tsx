import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Scales } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';

export function LendPage() {
  const { state, recordLenderCheck } = useProgress();

  useEffect(() => {
    if (state.lenderChecks === 0) {
      recordLenderCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- record first visit once
  }, []);

  return (
    <div className="mx-auto max-w-[800px] px-4 py-12 md:px-8 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Lender desk</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Eligibility check</h1>
      <p className="mt-4 max-w-[52ch] text-mist">
        Browse tier badges and consistency counts on the public board. Full credential proofs against a
        worker&apos;s badge are coming with the next update.
      </p>

      <section className="mt-10 border border-line bg-ink-elevated p-6 md:p-8">
        <div className="flex items-start gap-4">
          <Scales size={28} weight="duotone" className="shrink-0 text-accent" />
          <div>
            <h2 className="font-display text-xl font-bold">What you can do today</h2>
            <ul className="mt-4 space-y-2 text-sm text-mist">
              <li>Scan Bronze, Silver, and Gold badges on the public board</li>
              <li>Compare consistency months at disclosed floors</li>
              <li>Log eligibility checks locally for your own workflow</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-6 border border-accent/30 bg-accent/5 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <Clock size={28} weight="duotone" className="shrink-0 text-accent" />
          <div>
            <h2 className="font-display text-xl font-bold">Coming with next update</h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              The <span className="text-paper">proveCredential</span> circuit isn&apos;t wired in P0
              yet. When it lands, lenders will verify a badge against a floor without learning dollar
              amounts or platform names.
            </p>
            <p className="mt-4 font-mono text-[11px] text-mist">
              Local checks logged: {state.lenderChecks}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/registry"
          className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-accent-dim active:scale-[0.98]"
        >
          Browse public board
        </Link>
        <button
          type="button"
          onClick={() => recordLenderCheck()}
          className="inline-flex items-center gap-2 border border-line px-5 py-3 text-sm text-paper transition hover:border-mist active:scale-[0.98]"
        >
          Log another check
        </button>
      </div>
    </div>
  );
}
