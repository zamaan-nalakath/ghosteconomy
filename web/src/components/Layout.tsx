import { NavLink, Link } from 'react-router-dom';
import { Wallet, Plugs } from '@phosphor-icons/react';
import { useApp } from '../lib/AppContext';

function trunc(hex: string, head = 6, tail = 4) {
  if (hex.length <= head + tail + 1) return hex;
  return `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

export function NavBar() {
  const { session, busy, connect, disconnect } = useApp();

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden />
            Ghost Economy
          </Link>
          <nav className="nav-links" aria-label="Primary">
            <NavLink to="/" end>
              Story
            </NavLink>
            <NavLink to="/app">Prove</NavLink>
            <NavLink to="/registry">Registry</NavLink>
            <NavLink to="/privacy">Privacy</NavLink>
          </nav>
          <div className="nav-actions">
            {session ? (
              <>
                <span className="wallet-chip" title={session.unshieldedAddress}>
                  {trunc(session.unshieldedAddress)}
                </span>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={busy}
                  onClick={() => void disconnect()}
                >
                  <Plugs size={16} weight="bold" />
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => void connect()}
              >
                <Wallet size={16} weight="bold" />
                Connect wallet
              </button>
            )}
          </div>
        </div>
      </header>
      <nav className="mobile-nav" aria-label="Mobile">
        <NavLink to="/" end>
          Story
        </NavLink>
        <NavLink to="/app">Prove</NavLink>
        <NavLink to="/registry">Registry</NavLink>
        <NavLink to="/privacy">Privacy</NavLink>
      </nav>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>Ghost Economy on Midnight</span>
        <span>Private income proofs for gig workers</span>
      </div>
    </footer>
  );
}
