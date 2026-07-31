import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CircleNotch, Wallet, X } from '@phosphor-icons/react';
import { networkHint, networkLabel } from '../lib/networkLabels';
import { NETWORK_ID } from '../config';

type Props = {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConnect: () => void;
};

export function ConnectWalletModal({ open, busy, onClose, onConnect }: Props) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/80 p-4 backdrop-blur-sm sm:items-center"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) onClose();
          }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative w-full max-w-md border border-line bg-ink-elevated p-6 md:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="absolute right-4 top-4 text-mist transition hover:text-paper disabled:opacity-40"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Enter the night city
            </p>
            <h2 id="connect-title" className="mt-2 font-display text-2xl font-extrabold tracking-tight">
              Connect your wallet
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Ghost Economy uses Lace or 1AM so you can prove income privately. Your dollar amounts
              never leave this device.
            </p>

            <div className="mt-6 border border-line bg-ink/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist">Network</p>
              <p className="mt-2 font-display text-lg font-bold text-paper">
                {networkLabel(NETWORK_ID)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-mist">{networkHint(NETWORK_ID)}</p>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-mist">
              <li className="flex gap-2">
                <span className="text-accent">01</span>
                Install Lace or 1AM with Midnight support
              </li>
              <li className="flex gap-2">
                <span className="text-accent">02</span>
                Unlock the extension, then approve this site
              </li>
              <li className="flex gap-2">
                <span className="text-accent">03</span>
                You’ll be ready to prove or check eligibility
              </li>
            </ul>

            <button
              type="button"
              disabled={busy}
              onClick={onConnect}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-accent px-4 py-3 text-sm font-bold text-ink transition hover:bg-accent-dim disabled:opacity-50 active:scale-[0.98]"
            >
              {busy ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <Wallet size={16} weight="bold" />
              )}
              {busy ? 'Connecting…' : 'Connect Lace or 1AM'}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
