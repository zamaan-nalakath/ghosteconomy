import { useApp } from '../lib/AppContext';

function trunc(hex: string) {
  return hex.length > 18 ? `${hex.slice(0, 10)}…${hex.slice(-8)}` : hex;
}

export function RegistryPage() {
  const { contractAddress, registry, busy, refresh, error } = useApp();

  return (
    <div className="page">
      <div className="container">
        <header className="page-header">
          <h1>Public registry</h1>
          <p>
            Indexer-visible state only: profile commitments, income tiers, and
            consistency months. Raw dollar amounts never appear here.
          </p>
        </header>

        <section className="panel">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ marginBottom: 0 }}>Profiles on chain</h2>
              <p className="mono" style={{ margin: '0.45rem 0 0', color: 'var(--fog)' }}>
                {contractAddress}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy || !contractAddress}
              onClick={() => void refresh()}
            >
              Refresh
            </button>
          </div>

          <div className="table-wrap" style={{ marginTop: '1.25rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Worker</th>
                  <th>Tier</th>
                  <th>Consistency</th>
                </tr>
              </thead>
              <tbody>
                {!registry || registry.entries.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ color: 'var(--fog)' }}>
                      No public profiles yet. Register from the Prove page.
                    </td>
                  </tr>
                ) : (
                  registry.entries.map((entry) => (
                    <tr key={entry.profileCommitment}>
                      <td className="mono" title={entry.profileCommitment}>
                        {trunc(entry.profileCommitment)}
                      </td>
                      <td className="mono" title={entry.workerCommitment}>
                        {trunc(entry.workerCommitment)}
                      </td>
                      <td>
                        <span className="badge">{entry.tierLabel}</span>
                      </td>
                      <td>{entry.consistencyMonths} months</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {registry && (
            <p style={{ marginTop: '1rem', color: 'var(--fog)', fontSize: '0.9rem' }}>
              nextProfileId counter: {registry.profileCount}
            </p>
          )}
        </section>

        {error && <div className="status error">{error}</div>}
      </div>
    </div>
  );
}
