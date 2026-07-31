import { NavLink, Link } from 'react-router-dom';
import { CircleNotch, GearSix, SignOut, Wallet } from '@phosphor-icons/react';
import { useProgress } from './ProgressProvider';

const links = [
  { to: '/home', label: 'Home' },
  { to: '/prove', label: 'Prove' },
  { to: '/registry', label: 'Board' },
  { to: '/activity', label: 'Activity' },
  { to: '/profile', label: 'Profile' },
];

type Props = {
  bare?: boolean;
  connected: boolean;
  busy: boolean;
  onOpenConnect: () => void;
  onDisconnect: () => void;
};

export function AppChrome({ bare, connected, busy, onOpenConnect, onDisconnect }: Props) {
  const { state, rank } = useProgress();

  if (bare) {
    return (
      <header className="absolute left-0 right-0 top-0 z-40">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-paper">
            Ghost<span className="text-accent">Economy</span>
          </Link>
          <Link
            to="/help"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-mist transition hover:text-paper"
          >
            Help
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/home" className="font-display text-lg font-extrabold tracking-tight text-paper">
          Ghost<span className="text-accent">Economy</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `font-mono text-[12px] uppercase tracking-[0.14em] transition-colors ${
                  isActive ? 'text-accent' : 'text-mist hover:text-paper'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-mist lg:inline">
            {state.displayName} · {rank.current.label}
          </span>
          <Link
            to="/settings"
            className="inline-flex items-center justify-center border border-line p-2 text-mist transition hover:border-mist hover:text-paper"
            aria-label="Settings"
          >
            <GearSix size={16} />
          </Link>
          {connected ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={busy}
              className="inline-flex items-center gap-2 border border-line bg-ink-elevated px-3 py-2 text-[12px] font-medium text-paper transition hover:border-mist disabled:opacity-50 active:scale-[0.98]"
            >
              <SignOut size={14} weight="bold" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenConnect}
              disabled={busy}
              className="inline-flex items-center gap-2 bg-accent px-3 py-2 text-[12px] font-bold text-ink transition hover:bg-accent-dim disabled:opacity-50 active:scale-[0.98]"
            >
              {busy ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <Wallet size={14} weight="bold" />
              )}
              Connect
            </button>
          )}
        </div>
      </div>

      <nav className="flex gap-4 overflow-x-auto border-t border-line/60 px-4 py-2 md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] ${
                isActive ? 'text-accent' : 'text-mist'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
