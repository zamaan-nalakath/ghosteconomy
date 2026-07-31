import { Link } from 'react-router-dom';
import { ShieldCheck, LockKey, Broadcast, Warning, Question } from '@phosphor-icons/react';

export function HelpPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8 md:py-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Help & privacy</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
        How Ghost Economy keeps you private
      </h1>
      <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-mist">
        Ghost Economy is a gig income passport on Midnight. You prove stability so lenders can trust
        the signal — without dumping every receipt.
      </p>

      <div className="mt-14 space-y-10">
        <div className="border-t border-line pt-8">
          <div className="flex items-start gap-4">
            <LockKey size={24} className="mt-1 shrink-0 text-accent" weight="duotone" />
            <div>
              <h2 className="font-display text-xl font-bold">What stays private</h2>
              <ul className="mt-3 space-y-2 text-mist">
                <li>Your twelve monthly dollar totals (kept in this browser)</li>
                <li>Platform names, tips, and night-shift splits</li>
                <li>Any link from exact income figures to your public tier</li>
                <li>Your Lace / 1AM wallet tied to specific dollar amounts</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-8">
          <div className="flex items-start gap-4">
            <Broadcast size={24} className="mt-1 shrink-0 text-accent" weight="duotone" />
            <div>
              <h2 className="font-display text-xl font-bold">What stays public</h2>
              <ul className="mt-3 space-y-2 text-mist">
                <li>Coarse tier: Unverified, Bronze, Silver, or Gold</li>
                <li>How many consecutive months cleared your chosen floor</li>
                <li>Opaque commitments — not recoverable dollar amounts</li>
                <li>The floor you argued in the public transcript</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-8">
          <div className="flex items-start gap-4">
            <ShieldCheck size={24} className="mt-1 shrink-0 text-accent" weight="duotone" />
            <div>
              <h2 className="font-display text-xl font-bold">What you can do</h2>
              <ul className="mt-3 space-y-2 text-mist">
                <li>
                  <span className="text-paper">Prove income</span> — earn a badge from private months
                </li>
                <li>
                  <span className="text-paper">Browse the board</span> — see tiers others chose to
                  disclose
                </li>
                <li>
                  <span className="text-paper">Lender desk</span> — scan badges today; credential
                  proofs arrive in the next update
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-8">
          <div className="flex items-start gap-4">
            <Question size={24} className="mt-1 shrink-0 text-accent" weight="duotone" />
            <div>
              <h2 className="font-display text-xl font-bold">Wallets & waiting</h2>
              <ul className="mt-3 space-y-2 text-mist">
                <li>Use Lace or 1AM set to the network shown in Settings</li>
                <li>Creating your private proof can take up to a minute — keep the tab open</li>
                <li>Approve prompts in your wallet when they appear</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-ember/40 bg-ember/5 p-6">
          <div className="flex items-start gap-3">
            <Warning size={22} className="mt-0.5 shrink-0 text-ember" weight="fill" />
            <p className="text-sm leading-relaxed text-paper/90">
              Observers learn the floor you argued in the public transcript and the resulting tier.
              They cannot recover your exact monthly dollars from registry data alone. Standing, streaks,
              and achievements in this app are browser-local — not on-chain.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          to="/prove"
          className="inline-flex bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-accent-dim active:scale-[0.98]"
        >
          Start proving
        </Link>
        <Link
          to="/settings"
          className="inline-flex border border-line px-5 py-3 text-sm text-paper transition hover:border-mist"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
