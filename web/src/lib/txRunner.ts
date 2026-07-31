import { friendlyError } from './BrowserGhostEconomyManager';
import type { TxFlowState } from '../components/TxFlow';

type SetFlow = (flow: TxFlowState | ((prev: TxFlowState) => TxFlowState)) => void;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Drive the shared TxFlow overlay through prepare → prove → confirm → record.
 */
export async function runTxFlow(opts: {
  setFlow: SetFlow;
  action: string;
  successTitle: string;
  successDetail?: string;
  work: () => Promise<void>;
  onRefresh?: () => Promise<void>;
  onError?: (msg: string) => void;
}): Promise<boolean> {
  const { setFlow, action, successTitle, successDetail, work, onRefresh, onError } = opts;
  let settled = false;

  setFlow({
    open: true,
    phase: 'preparing',
    action,
    successTitle,
  });

  try {
    await delay(280);
    setFlow((f) => ({ ...f, phase: 'proving' }));

    const proving = work();
    const phaseTimer = window.setTimeout(() => {
      if (!settled) {
        setFlow((f) =>
          f.open && (f.phase === 'proving' || f.phase === 'preparing')
            ? { ...f, phase: 'confirming' }
            : f,
        );
      }
    }, 1400);

    await proving;
    settled = true;
    window.clearTimeout(phaseTimer);

    setFlow((f) => ({ ...f, phase: 'settling' }));
    if (onRefresh) await onRefresh();
    await delay(400);
    setFlow((f) => ({
      ...f,
      phase: 'success',
      successTitle,
      detail: successDetail,
    }));
    return true;
  } catch (e) {
    settled = true;
    const msg = friendlyError(e);
    setFlow((f) => ({
      ...f,
      phase: 'failure',
      error: msg,
    }));
    onError?.(msg);
    return false;
  }
}
