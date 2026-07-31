import { useApp } from '../lib/AppContext';
import { NETWORK_ID } from '../config';

const MONTH_LABELS = [
  'M1',
  'M2',
  'M3',
  'M4',
  'M5',
  'M6',
  'M7',
  'M8',
  'M9',
  'M10',
  'M11',
  'M12',
];

function centsToDollars(cents: number) {
  return (cents / 100).toFixed(2);
}

function truncHex(hex: string, head = 12, tail = 8) {
  return hex.length <= head + tail + 1 ? hex : `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

export function ProvePage() {
  const {
    connected,
    unshieldedAddress,
    contractAddress,
    monthlyIncomeCents,
    minMonthlyCents,
    requiredMonths,
    busy,
    error,
    status,
    profilePreview,
    workerPreview,
    setMonthlyIncomeCents,
    setMinMonthlyCents,
    setRequiredMonths,
    connect,
    disconnect,
    register,
  } = useApp();

  function updateMonth(index: number, dollars: string) {
    const next = [...monthlyIncomeCents];
    const value = Math.max(0, Math.round(Number(dollars || 0) * 100));
    next[index] = Number.isFinite(value) ? value : 0;
    setMonthlyIncomeCents(next);
  }

  function fillUniform(dollars: number) {
    setMonthlyIncomeCents(Array.from({ length: 12 }, () => Math.round(dollars * 100)));
  }

  return (
    <div className="page">
      <div className="container">
        <header className="page-header">
          <h1>Prove income stability</h1>
          <p>
            Enter twelve private monthly totals. The circuit{' '}
            <span className="mono">registerIncomeProfile</span> discloses only a
            tier and consistency count.
          </p>
        </header>

        <section className="panel">
          <h2>Wallet &amp; contract</h2>
          <p className="hint" style={{ marginTop: 0, color: 'var(--fog)' }}>
            Lace / 1AM on <code>{NETWORK_ID}</code>. Connect to join the deployed contract.
          </p>
          <div className="row" style={{ marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.65rem' }}>
            {!connected ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => void connect()}
              >
                Connect Lace / 1AM
              </button>
            ) : (
              <>
                <span className="status-chip">
                  {unshieldedAddress ? truncHex(unshieldedAddress) : 'Connected'}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => void disconnect()}
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
          <p className="mono" style={{ marginTop: '0.85rem', wordBreak: 'break-all' }}>
            {contractAddress}
          </p>
        </section>

        <section className="panel">
          <h2>Private monthly income (USD)</h2>
          <p className="hint" style={{ margin: '0 0 1rem', color: 'var(--fog)' }}>
            Stored only in local private state. Never sent to the indexer.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => fillUniform(3200)}>
              Fill $3,200
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => fillUniform(1800)}>
              Fill $1,800
            </button>
          </div>
          <div className="income-grid">
            {MONTH_LABELS.map((label, i) => (
              <div className="field" key={label}>
                <label htmlFor={`m-${i}`}>{label}</label>
                <input
                  id={`m-${i}`}
                  type="number"
                  min={0}
                  step={50}
                  value={Number((monthlyIncomeCents[i] / 100).toFixed(2))}
                  onChange={(e) => updateMonth(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Public proof parameters</h2>
          <p className="hint" style={{ margin: '0 0 1rem', color: 'var(--fog)' }}>
            These arguments are public on the transcript. Observers learn the
            floor you chose to prove against, not your exact income.
          </p>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="min-monthly">Minimum monthly (USD)</label>
              <input
                id="min-monthly"
                type="number"
                min={0}
                step={50}
                value={Number((minMonthlyCents / 100).toFixed(2))}
                onChange={(e) =>
                  setMinMonthlyCents(Math.max(0, Math.round(Number(e.target.value || 0) * 100)))
                }
              />
              <span className="hint">
                Current: ${centsToDollars(minMonthlyCents)} ({minMonthlyCents} cents)
              </span>
            </div>
            <div className="field">
              <label htmlFor="required-months">Required consecutive months</label>
              <input
                id="required-months"
                type="number"
                min={1}
                max={12}
                value={requiredMonths}
                onChange={(e) =>
                  setRequiredMonths(Math.min(12, Math.max(1, Number(e.target.value || 1))))
                }
              />
              <span className="hint">Circuit asserts consistencyMonths ≥ this value</span>
            </div>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || !connected}
              onClick={() => void register()}
            >
              Call registerIncomeProfile
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Local commitment preview</h2>
          <div className="grid-2">
            <div>
              <div className="hint">profileCommitment</div>
              <div className="mono" style={{ marginTop: '0.35rem', wordBreak: 'break-all' }}>
                {profilePreview}
              </div>
            </div>
            <div>
              <div className="hint">workerCommitment</div>
              <div className="mono" style={{ marginTop: '0.35rem', wordBreak: 'break-all' }}>
                {workerPreview}
              </div>
            </div>
          </div>
        </section>

        {status && <div className="status ok">{status}</div>}
        {error && <div className="status error">{error}</div>}
      </div>
    </div>
  );
}
