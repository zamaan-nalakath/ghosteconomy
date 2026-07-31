import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import pino from 'pino';
import {
  GhostEconomyAPI,
  type RegistryState,
} from '../../../api/src/index.js';
import {
  BrowserGhostEconomyManager,
  friendlyError,
  loadIncomeDraft,
  saveIncomeDraft,
  updatePrivateStateIncome,
} from './BrowserGhostEconomyManager';
import { CONTRACT_ADDRESS, INDEXER_URL, NETWORK_ID } from '../config';

type AppContextValue = {
  connected: boolean;
  unshieldedAddress: string | null;
  contractAddress: string;
  registry: RegistryState | null;
  monthlyIncomeCents: number[];
  minMonthlyCents: number;
  requiredMonths: number;
  busy: boolean;
  error: string | null;
  status: string | null;
  profilePreview: string;
  workerPreview: string;
  setMonthlyIncomeCents: (values: number[]) => void;
  setMinMonthlyCents: (v: number) => void;
  setRequiredMonths: (v: number) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  register: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const managerRef = useRef<BrowserGhostEconomyManager | null>(null);
  const [connected, setConnected] = useState(false);
  const [unshieldedAddress, setUnshieldedAddress] = useState<string | null>(null);
  const [registry, setRegistry] = useState<RegistryState | null>(null);
  const [monthlyIncomeCents, setMonthlyIncomeCentsState] = useState<number[]>(() =>
    loadIncomeDraft(),
  );
  const [minMonthlyCents, setMinMonthlyCents] = useState(200_000);
  const [requiredMonths, setRequiredMonths] = useState(6);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const secrets = useMemo(
    () => createInitialPrivateStateFromIncome(monthlyIncomeCents),
    [monthlyIncomeCents],
  );

  const previews = useMemo(() => GhostEconomyAPI.commitmentPreviews(secrets), [secrets]);

  const getManager = useCallback(() => {
    if (!managerRef.current) {
      const logger = pino({ level: 'warn', browser: { asObject: true } });
      managerRef.current = new BrowserGhostEconomyManager(logger);
    }
    return managerRef.current;
  }, []);

  function createInitialPrivateStateFromIncome(income: number[]) {
    return updatePrivateStateIncome(income);
  }

  const setMonthlyIncomeCents = useCallback((values: number[]) => {
    setMonthlyIncomeCentsState(values);
    saveIncomeDraft(values);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const state = await GhostEconomyAPI.fetchRegistryState(
        INDEXER_URL,
        CONTRACT_ADDRESS,
        NETWORK_ID,
      );
      setRegistry(state);
      setError(null);
    } catch (e) {
      setError(friendlyError(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 12_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const connect = useCallback(async () => {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const manager = getManager();
      const session = await manager.getSession();
      await manager.join(CONTRACT_ADDRESS, secrets);
      setUnshieldedAddress(session.unshieldedAddress);
      setConnected(true);
      setStatus(`Connected on ${NETWORK_ID} — joined contract via findDeployedContract`);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }, [getManager, secrets]);

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      await getManager().disconnect();
    } catch {
      /* ignore */
    }
    setConnected(false);
    setUnshieldedAddress(null);
    setStatus('Wallet disconnected');
    setBusy(false);
  }, [getManager]);

  const register = useCallback(async () => {
    setBusy(true);
    setError(null);
    setStatus('Proving registerIncomeProfile…');
    try {
      const privateState = updatePrivateStateIncome(monthlyIncomeCents);
      const api = await getManager().join(CONTRACT_ADDRESS, privateState);
      await api.registerIncomeProfile(minMonthlyCents, requiredMonths);
      setStatus('Income profile registered. Dollar amounts stayed off-chain.');
      await refresh();
    } catch (e) {
      setError(friendlyError(e));
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, [getManager, monthlyIncomeCents, minMonthlyCents, requiredMonths, refresh]);

  const value = useMemo<AppContextValue>(
    () => ({
      connected,
      unshieldedAddress,
      contractAddress: CONTRACT_ADDRESS,
      registry,
      monthlyIncomeCents,
      minMonthlyCents,
      requiredMonths,
      busy,
      error,
      status,
      profilePreview: previews.profile,
      workerPreview: previews.worker,
      setMonthlyIncomeCents,
      setMinMonthlyCents,
      setRequiredMonths,
      connect,
      disconnect,
      register,
      refresh,
      clearError: () => setError(null),
    }),
    [
      connected,
      unshieldedAddress,
      registry,
      monthlyIncomeCents,
      minMonthlyCents,
      requiredMonths,
      busy,
      error,
      status,
      previews,
      setMonthlyIncomeCents,
      connect,
      disconnect,
      register,
      refresh,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
