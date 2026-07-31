import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CircleNotch } from '@phosphor-icons/react';
import { GhostEconomyAPI } from '../../../api/src/index.js';
import type { BrowserGhostEconomyManager } from '../lib/BrowserGhostEconomyManager';
import {
  loadIncomeDraft,
  saveIncomeDraft,
  updatePrivateStateIncome,
} from '../lib/BrowserGhostEconomyManager';
import { AdvancedDetails } from '../components/AdvancedDetails';
import { useProgress } from '../components/ProgressProvider';
import type { TxFlowState } from '../components/TxFlow';
import { runTxFlow } from '../lib/txRunner';
import {
  MONTH_LABELS,
  centsToDollarsInput,
  dollarsToCents,
  formatUsd,
  predictTier,
} from '../lib/tier';
import { CONTRACT_ADDRESS } from '../config';

type Props = {
  connected: boolean;
  busy: boolean;
  manager: BrowserGhostEconomyManager;
  onBusy: (v: boolean) => void;
  onOpenConnect: () => void;
  onTxFlow: (flow: TxFlowState | ((prev: TxFlowState) => TxFlowState)) => void;
  onRefresh: () => Promise<void>;
  onToast: (tone: 'ok' | 'warn' | 'info', title: string, body?: string) => void;
};

const STEP_LABELS = ['First quarter', 'Rest of year', 'Floor & goal'];

export function ProvePage({
  connected,
  busy,
  manager,
  onBusy,
  onOpenConnect,
  onTxFlow,
  onRefresh,
  onToast,
}: Props) {
  const navigate = useNavigate();
  const { recordProve } = useProgress();
  const [step, setStep] = useState(0);
  const [monthlyIncomeCents, setMonthlyIncomeCents] = useState<number[]>(() => loadIncomeDraft());
  const [minMonthlyCents, setMinMonthlyCents] = useState(200_000);
  const [requiredMonths, setRequiredMonths] = useState(6);

  const prediction = useMemo(
    () => predictTier(monthlyIncomeCents, minMonthlyCents),
    [monthlyIncomeCents, minMonthlyCents],
  );

  const previews = useMemo(
    () => GhostEconomyAPI.commitmentPreviews(updatePrivateStateIncome(monthlyIncomeCents)),
    [monthlyIncomeCents],
  );

  function updateMonths(indices: number[], dollars: string) {
    const next = [...monthlyIncomeCents];
    for (const i of indices) {
      next[i] = dollarsToCents(Number(dollars || 0));
    }
    setMonthlyIncomeCents(next);
    saveIncomeDraft(next);
  }

  function fillUniform(dollars: number) {
    const next = Array.from({ length: 12 }, () => dollarsToCents(dollars));
    setMonthlyIncomeCents(next);
    saveIncomeDraft(next);
  }

  async function handleProve() {
    if (!connected) {
      onOpenConnect();
      return;
    }
    if (!prediction.meetsRequired(requiredMonths)) {
      onToast(
        'warn',
        'Floor not met yet',
        `You need ${requiredMonths} consecutive months at ${formatUsd(minMonthlyCents)}. Right now: ${prediction.consistencyMonths}.`,
      );
      return;
    }

    onBusy(true);
    const detail = `${prediction.tier} · ${prediction.consistencyMonths} consecutive months. Dollar amounts stayed private.`;
    const ok = await runTxFlow({
      setFlow: onTxFlow,
      action: 'Prove income',
      successTitle: 'Badge earned',
      successDetail: detail,
      work: async () => {
        const privateState = updatePrivateStateIncome(monthlyIncomeCents);
        const api = await manager.join(CONTRACT_ADDRESS, privateState);
        await api.registerIncomeProfile(minMonthlyCents, requiredMonths);
      },
      onRefresh,
      onError: (msg) => onToast('warn', 'Prove didn’t complete', msg),
    });

    onBusy(false);

    if (ok) {
      recordProve(prediction.tier);
      onToast('ok', 'Badge earned', detail);
      navigate('/badge', { state: { tier: prediction.tier } });
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        Prove · Step {String(step + 1).padStart(2, '0')} / 03
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Prove your income</h1>
      <p className="mt-4 max-w-[55ch] text-lg leading-relaxed text-mist">
        Enter private months in two passes, set your floor, then publish only the badge lenders need.
      </p>

      <div className="mt-8 flex gap-2">
        {STEP_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(i)}
            className={`flex-1 border px-3 py-3 text-left transition ${
              i === step
                ? 'border-accent bg-accent/10'
                : i < step
                  ? 'border-accent/40 bg-ink-elevated'
                  : 'border-line bg-ink'
            }`}
          >
            <span className="font-mono text-[10px] text-mist">{String(i + 1).padStart(2, '0')}</span>
            <span className="mt-1 block text-sm font-medium text-paper">{label}</span>
          </button>
        ))}
      </div>

      {step === 0 ? (
        <section className="mt-8 border border-line bg-ink-elevated p-6 md:p-8">
          <h2 className="font-display text-xl font-bold">First quarter</h2>
          <p className="mt-2 text-sm text-mist">
            Jan–Mar stays on this device until you prove. Enter what you actually earned each month.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fillUniform(3200)}
              className="border border-line px-3 py-1.5 text-xs text-paper transition hover:border-mist"
            >
              Fill all months $3,200
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {MONTH_LABELS.slice(0, 3).map((label, i) => (
              <label key={label} className="block">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mist">
                  {label}
                </span>
                <div className="mt-2 flex border border-line bg-ink focus-within:border-accent">
                  <span className="px-3 py-3 text-sm text-mist">$</span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={centsToDollarsInput(monthlyIncomeCents[i] ?? 0)}
                    onChange={(e) => updateMonths([i], e.target.value)}
                    className="min-w-0 flex-1 bg-transparent py-3 pr-3 text-sm text-paper outline-none"
                  />
                </div>
              </label>
            ))}
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="mt-8 border border-line bg-ink-elevated p-6 md:p-8">
          <h2 className="font-display text-xl font-bold">Rest of the year</h2>
          <p className="mt-2 text-sm text-mist">Apr–Dec completes your private twelve-month picture.</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {MONTH_LABELS.slice(3).map((label, offset) => {
              const i = offset + 3;
              return (
                <label key={label} className="block">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mist">
                    {label}
                  </span>
                  <div className="mt-2 flex border border-line bg-ink focus-within:border-accent">
                    <span className="px-3 py-3 text-sm text-mist">$</span>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={centsToDollarsInput(monthlyIncomeCents[i] ?? 0)}
                      onChange={(e) => updateMonths([i], e.target.value)}
                      className="min-w-0 flex-1 bg-transparent py-3 pr-3 text-sm text-paper outline-none"
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="mt-8 border border-line bg-ink-elevated p-6 md:p-8">
          <h2 className="font-display text-xl font-bold">Floor & tier goal</h2>
          <p className="mt-2 text-sm text-mist">
            Observers learn the floor you prove against — not exact monthly dollars.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mist">
                Minimum monthly
              </span>
              <div className="mt-2 flex border border-line bg-ink focus-within:border-accent">
                <span className="px-3 py-3 text-sm text-mist">$</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={centsToDollarsInput(minMonthlyCents)}
                  onChange={(e) => setMinMonthlyCents(dollarsToCents(Number(e.target.value || 0)))}
                  className="min-w-0 flex-1 bg-transparent py-3 pr-3 text-sm text-paper outline-none"
                />
              </div>
              <span className="mt-2 block text-xs text-mist">Floor: {formatUsd(minMonthlyCents)} / month</span>
            </label>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-mist">
                Months in a row
              </span>
              <input
                type="number"
                min={1}
                max={12}
                value={requiredMonths}
                onChange={(e) =>
                  setRequiredMonths(Math.min(12, Math.max(1, Number(e.target.value || 1))))
                }
                className="mt-2 w-full border border-line bg-ink px-4 py-3 text-sm text-paper outline-none focus:border-accent"
              />
              <span className="mt-2 block text-xs text-mist">Must clear this many consecutive months</span>
            </label>
          </div>

          <div
            className={`mt-8 border p-6 ${
              prediction.tier === 'Gold'
                ? 'border-accent/50 bg-accent/10'
                : prediction.tier === 'Silver'
                  ? 'border-mist/40 bg-ink'
                  : prediction.tier === 'Bronze'
                    ? 'border-accent-dim/40 bg-ink'
                    : 'border-line bg-ink'
            }`}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">Your preview</p>
            <p className="mt-2 font-display text-4xl font-extrabold text-accent">{prediction.tier}</p>
            <p className="mt-2 text-sm text-mist">
              {prediction.consistencyMonths} consecutive month
              {prediction.consistencyMonths === 1 ? '' : 's'} at {formatUsd(minMonthlyCents)}+
            </p>
            {!prediction.meetsRequired(requiredMonths) ? (
              <p className="mt-4 text-sm text-ember">
                Need {requiredMonths} months — currently {prediction.consistencyMonths}. Adjust income or
                floor before proving.
              </p>
            ) : (
              <p className="mt-4 text-sm text-ok">Ready to prove for {requiredMonths} required months.</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {(['Bronze', 'Silver', 'Gold'] as const).map((t) => (
              <span
                key={t}
                className={`border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] ${
                  prediction.tier === t
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-line text-mist'
                }`}
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {!connected ? (
              <button
                type="button"
                onClick={onOpenConnect}
                className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-accent-dim active:scale-[0.98]"
              >
                Connect to prove
              </button>
            ) : (
              <button
                type="button"
                disabled={busy || !prediction.meetsRequired(requiredMonths)}
                onClick={() => void handleProve()}
                className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-bold text-ink disabled:opacity-50 active:scale-[0.98]"
              >
                {busy ? <CircleNotch size={16} className="animate-spin" /> : null}
                Prove & earn badge
              </button>
            )}
          </div>

          <AdvancedDetails label="Commitment preview">
            <p>profileCommitment: {previews.profile}</p>
            <p>workerCommitment: {previews.worker}</p>
          </AdvancedDetails>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex items-center gap-2 border border-line px-4 py-2.5 text-sm text-paper transition hover:border-mist active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 bg-accent px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-accent-dim active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={14} weight="bold" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
