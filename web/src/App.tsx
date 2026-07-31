import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import pino from 'pino';
import { GhostEconomyAPI, type RegistryState } from '../../api/src/index.js';
import { AppChrome } from './components/AppChrome';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { ProgressProvider, useProgress } from './components/ProgressProvider';
import { RequireOnboarded } from './components/RequireOnboarded';
import { ToastProvider, useToasts } from './components/StatusToasts';
import { idleTxFlow, TxFlow, type TxFlowState } from './components/TxFlow';
import {
  BrowserGhostEconomyManager,
  friendlyError,
  getOrCreateSecrets,
} from './lib/BrowserGhostEconomyManager';
import { CONTRACT_ADDRESS, INDEXER_URL, NETWORK_ID } from './config';
import { networkLabel } from './lib/networkLabels';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { ProvePage } from './pages/ProvePage';
import { BadgePage } from './pages/BadgePage';
import { RegistryPage } from './pages/RegistryPage';
import { LendPage } from './pages/LendPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';

function AppShell() {
  const location = useLocation();
  const { state, recordConnect } = useProgress();
  const { push } = useToasts();

  const managerRef = useRef<BrowserGhostEconomyManager | null>(null);
  const [connected, setConnected] = useState(false);
  const [unshieldedAddress, setUnshieldedAddress] = useState<string | null>(null);
  const [registry, setRegistry] = useState<RegistryState | null>(null);
  const [busy, setBusy] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [txFlow, setTxFlow] = useState<TxFlowState>(idleTxFlow);

  const bareChrome = location.pathname === '/' || location.pathname === '/onboarding';

  const getManager = useCallback(() => {
    if (!managerRef.current) {
      const logger = pino({ level: 'warn', browser: { asObject: true } });
      managerRef.current = new BrowserGhostEconomyManager(logger);
    }
    return managerRef.current;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const next = await GhostEconomyAPI.fetchRegistryState(
        INDEXER_URL,
        CONTRACT_ADDRESS,
        NETWORK_ID,
      );
      setRegistry(next);
    } catch {
      // Quiet refresh failures
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    document.documentElement.classList.toggle('compact', state.compactMode);
  }, [state.compactMode]);

  async function onConnect() {
    setBusy(true);
    try {
      const manager = getManager();
      const session = await manager.getSession();
      await manager.join(CONTRACT_ADDRESS, getOrCreateSecrets());
      setUnshieldedAddress(session.unshieldedAddress);
      setConnected(true);
      setConnectOpen(false);
      recordConnect();
      push({
        tone: 'ok',
        title: 'You’re in Ghost Economy',
        body: `Connected on ${networkLabel(NETWORK_ID)}.`,
      });
    } catch (e) {
      push({
        tone: 'warn',
        title: 'Couldn’t connect',
        body: friendlyError(e),
      });
    } finally {
      setBusy(false);
    }
  }

  async function onDisconnect() {
    setBusy(true);
    try {
      await getManager().disconnect();
    } catch {
      // ignore disconnect errors
    }
    setConnected(false);
    setUnshieldedAddress(null);
    setBusy(false);
    push({ tone: 'info', title: 'Left Ghost Economy' });
  }

  return (
    <div className="min-h-[100dvh] bg-ink text-paper">
      <AppChrome
        bare={bareChrome}
        connected={connected}
        busy={busy}
        onOpenConnect={() => setConnectOpen(true)}
        onDisconnect={() => void onDisconnect()}
      />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/home"
          element={
            <RequireOnboarded>
              <HomePage
                connected={connected}
                badgeCount={registry?.profileCount ?? null}
                onOpenConnect={() => setConnectOpen(true)}
              />
            </RequireOnboarded>
          }
        />
        <Route
          path="/prove"
          element={
            <RequireOnboarded>
              <ProvePage
                connected={connected}
                busy={busy}
                manager={getManager()}
                onBusy={setBusy}
                onOpenConnect={() => setConnectOpen(true)}
                onTxFlow={setTxFlow}
                onRefresh={refresh}
                onToast={(tone, title, body) => push({ tone, title, body })}
              />
            </RequireOnboarded>
          }
        />
        <Route
          path="/badge"
          element={
            <RequireOnboarded>
              <BadgePage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/registry"
          element={
            <RegistryPage
              registry={registry}
              busy={busy}
              onRefresh={() => void refresh()}
            />
          }
        />
        <Route
          path="/lend"
          element={
            <RequireOnboarded>
              <LendPage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/activity"
          element={
            <RequireOnboarded>
              <ActivityPage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireOnboarded>
              <ProfilePage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireOnboarded>
              <SettingsPage />
            </RequireOnboarded>
          }
        />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/app" element={<Navigate to="/prove" replace />} />
        <Route path="/privacy" element={<Navigate to="/help" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!bareChrome ? (
        <footer className="border-t border-line py-8 text-center text-[11px] text-mist">
          Ghost Economy — prove income, keep the night shift private
          {state.showAdvanced && unshieldedAddress ? (
            <span className="mt-2 block font-mono opacity-70">
              Session {unshieldedAddress.slice(0, 8)}…{unshieldedAddress.slice(-4)}
            </span>
          ) : null}
        </footer>
      ) : null}

      <ConnectWalletModal
        open={connectOpen}
        busy={busy}
        onClose={() => setConnectOpen(false)}
        onConnect={() => void onConnect()}
      />
      <TxFlow flow={txFlow} onClose={() => setTxFlow(idleTxFlow())} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProgressProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </ProgressProvider>
    </BrowserRouter>
  );
}
