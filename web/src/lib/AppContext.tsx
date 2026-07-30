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
import {
  createConnectedSession,
  detectWallet,
  type ConnectedSession,
} from '../lib/midnight';
import {
  deployContract,
  fetchRegistryState,
  joinContract,
  loadIncomeDraft,
  registerIncomeProfile,
  saveIncomeDraft,
  tryFetchRegistryState,
  ZK_PATH,
  type RegistryState,
} from '../lib/ghost-economy';
import { LOCAL_INDEXER, NETWORK_ID } from '../lib/network';

const CONTRACT_STORAGE_KEY = 'ghost-economy-contract';

type AppContextValue = {
  session: ConnectedSession | null;
  contractAddress: string | null;
  registry: RegistryState | null;
  monthlyIncomeCents: number[];
  minMonthlyCents: number;
  requiredMonths: number;
  busy: boolean;
  error: string | null;
  status: string | null;
  setMonthlyIncomeCents: (values: number[]) => void;
  setMinMonthlyCents: (v: number) => void;
  setRequiredMonths: (v: number) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  deploy: () => Promise<void>;
  join: (address: string) => Promise<void>;
  register: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [registry, setRegistry] = useState<RegistryState | null>(null);
  const [monthlyIncomeCents, setMonthlyIncomeCentsState] = useState<number[]>(() =>
    loadIncomeDraft(),
  );
  const [minMonthlyCents, setMinMonthlyCents] = useState(200_000);
  const [requiredMonths, setRequiredMonths] = useState(6);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const sessionRef = useRef(session);
  const contractRef = useRef(contractAddress);
  sessionRef.current = session;
  contractRef.current = contractAddress;

  useEffect(() => {
    const stored = localStorage.getItem(CONTRACT_STORAGE_KEY);
    if (stored) setContractAddress(stored);
  }, []);

  const setMonthlyIncomeCents = useCallback((values: number[]) => {
    setMonthlyIncomeCentsState(values);
    saveIncomeDraft(values);
  }, []);

  const refresh = useCallback(async () => {
    const addr = contractRef.current;
    if (!addr) return;
    const indexerUrl = sessionRef.current?.config.indexerUri ?? LOCAL_INDEXER;
    try {
      const state =
        (await tryFetchRegistryState(indexerUrl, addr)) ??
        (await fetchRegistryState(indexerUrl, addr));
      setRegistry(state);
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (!contractAddress) return;
    const interval = setInterval(() => void refresh(), 12_000);
    return () => clearInterval(interval);
  }, [refresh, contractAddress]);

  const connect = useCallback(async () => {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const wallet = await detectWallet();
      const api = await wallet.connect(NETWORK_ID);
      const next = await createConnectedSession(api, ZK_PATH);
      setSession(next);
      setStatus(`Connected on ${NETWORK_ID}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (session?.api?.disconnect) await session.api.disconnect();
    setSession(null);
    setStatus('Wallet disconnected');
  }, [session]);

  const deploy = useCallback(async () => {
    if (!sessionRef.current) {
      setError('Connect Lace or 1AM first.');
      return;
    }
    setBusy(true);
    setError(null);
    setStatus('Deploying Ghost Economy contract…');
    try {
      const addr = await deployContract(sessionRef.current, monthlyIncomeCents);
      setContractAddress(addr);
      localStorage.setItem(CONTRACT_STORAGE_KEY, addr);
      setStatus(`Deployed at ${addr}`);
      await refresh();
    } catch (e) {
      setError(String(e));
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, [monthlyIncomeCents, refresh]);

  const join = useCallback(
    async (address: string) => {
      const addr = address.trim();
      if (!/^[0-9a-fA-F]{64}$/.test(addr)) {
        setError('Contract address must be 64 hex characters.');
        return;
      }
      setBusy(true);
      setError(null);
      try {
        if (sessionRef.current) {
          await joinContract(sessionRef.current, addr, monthlyIncomeCents);
        }
        setContractAddress(addr);
        localStorage.setItem(CONTRACT_STORAGE_KEY, addr);
        setStatus(`Joined ${addr}`);
        await refresh();
      } catch (e) {
        setError(String(e));
      } finally {
        setBusy(false);
      }
    },
    [monthlyIncomeCents, refresh],
  );

  const register = useCallback(async () => {
    if (!sessionRef.current || !contractRef.current) {
      setError('Connect wallet and deploy or join a contract first.');
      return;
    }
    setBusy(true);
    setError(null);
    setStatus('Proving registerIncomeProfile…');
    try {
      await registerIncomeProfile(
        sessionRef.current,
        contractRef.current,
        monthlyIncomeCents,
        minMonthlyCents,
        requiredMonths,
      );
      setStatus('Income profile registered. Amounts stay off-chain.');
      await refresh();
    } catch (e) {
      setError(String(e));
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, [monthlyIncomeCents, minMonthlyCents, requiredMonths, refresh]);

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      contractAddress,
      registry,
      monthlyIncomeCents,
      minMonthlyCents,
      requiredMonths,
      busy,
      error,
      status,
      setMonthlyIncomeCents,
      setMinMonthlyCents,
      setRequiredMonths,
      connect,
      disconnect,
      deploy,
      join,
      register,
      refresh,
      clearError: () => setError(null),
    }),
    [
      session,
      contractAddress,
      registry,
      monthlyIncomeCents,
      minMonthlyCents,
      requiredMonths,
      busy,
      error,
      status,
      setMonthlyIncomeCents,
      connect,
      disconnect,
      deploy,
      join,
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
