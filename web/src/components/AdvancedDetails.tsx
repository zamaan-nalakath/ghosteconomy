import type { ReactNode } from 'react';
import { useProgress } from './ProgressProvider';

type Props = {
  children: ReactNode;
  label?: string;
};

/** Developer / auditor details. Only renders when Settings → Show advanced is on. */
export function AdvancedDetails({ children, label = 'Advanced details' }: Props) {
  const { state } = useProgress();
  if (!state.showAdvanced) return null;

  return (
    <details className="mt-6 border border-line/80 bg-ink-elevated/40 open:border-mist/40">
      <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-mist transition hover:text-paper">
        {label}
      </summary>
      <div className="space-y-2 border-t border-line px-4 py-4 font-mono text-[11px] leading-relaxed text-mist break-all">
        {children}
      </div>
    </details>
  );
}
