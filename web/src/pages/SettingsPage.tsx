import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../components/ProgressProvider';
import { networkLabel } from '../lib/networkLabels';
import { NETWORK_ID, CONTRACT_ADDRESS } from '../config';
import { AdvancedDetails } from '../components/AdvancedDetails';
import { useToasts } from '../components/StatusToasts';
import type { PathChoice } from '../lib/progress';

export function SettingsPage() {
  const { state, updateSettings, resetLocalData } = useProgress();
  const { push } = useToasts();
  const [name, setName] = useState(state.displayName);

  function saveName() {
    updateSettings({ displayName: name.trim() || 'Anonymous earner' });
    push({ tone: 'ok', title: 'Display name saved' });
  }

  function handleReset() {
    if (!window.confirm('Reset local standing, achievements, and preferences on this device?')) {
      return;
    }
    resetLocalData();
    setName('Anonymous earner');
    push({
      tone: 'info',
      title: 'Local data cleared',
      body: 'Orientation will restart next visit.',
    });
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Settings</h1>
      <p className="mt-3 text-mist">Preferences stay in this browser.</p>

      <section className="mt-10 space-y-8">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">
            Display name
          </span>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="min-w-0 flex-1 border border-line bg-ink px-4 py-3 text-sm text-paper outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={saveName}
              className="shrink-0 bg-accent px-4 py-2 text-sm font-bold text-ink"
            >
              Save
            </button>
          </div>
        </label>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">Path</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(
              [
                { id: 'worker' as PathChoice, label: 'Worker' },
                { id: 'lender' as PathChoice, label: 'Lender' },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => updateSettings({ path: option.id })}
                className={`border px-4 py-3 text-sm transition ${
                  state.path === option.id
                    ? 'border-accent bg-accent/10 text-paper'
                    : 'border-line bg-ink-elevated text-mist hover:border-mist'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-start justify-between gap-4 border border-line bg-ink-elevated px-4 py-4">
          <span>
            <span className="block text-sm font-medium text-paper">Compact mode</span>
            <span className="mt-1 block text-xs text-mist">Tighter spacing for smaller screens.</span>
          </span>
          <input
            type="checkbox"
            checked={state.compactMode}
            onChange={(e) => updateSettings({ compactMode: e.target.checked })}
            className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
          />
        </label>

        <label className="flex cursor-pointer items-start justify-between gap-4 border border-line bg-ink-elevated px-4 py-4">
          <span>
            <span className="block text-sm font-medium text-paper">Show advanced details</span>
            <span className="mt-1 block text-xs text-mist">
              Reveal contract addresses and commitment hex where they appear.
            </span>
          </span>
          <input
            type="checkbox"
            checked={state.showAdvanced}
            onChange={(e) => updateSettings({ showAdvanced: e.target.checked })}
            className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
          />
        </label>

        <div className="border border-line bg-ink-elevated px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">Network</p>
          <p className="mt-2 font-display text-xl font-bold">{networkLabel(NETWORK_ID)}</p>
        </div>

        <AdvancedDetails label="Deployment details">
          <p>Network id: {NETWORK_ID}</p>
          <p>Contract: {CONTRACT_ADDRESS}</p>
        </AdvancedDetails>

        <button
          type="button"
          onClick={handleReset}
          className="border border-ember/40 px-4 py-2.5 text-sm text-ember transition hover:bg-ember/10"
        >
          Reset local data
        </button>

        <p className="text-sm text-mist">
          Questions about privacy?{' '}
          <Link to="/help" className="text-accent underline-offset-2 hover:underline">
            Read the help guide
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
