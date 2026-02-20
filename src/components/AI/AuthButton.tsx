import { useCallback, useEffect, useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { generatePKCE, getAuthorizationURL, exchangeCodeForTokens } from '../../services/oauth-service';

const isElectron = !!window.electron?.ipcRenderer;

export function AuthButton(): React.JSX.Element {
  const { status, setTokens, clearTokens, setStatus, setError, setCodeVerifier, codeVerifier, loadPersistedAuth } =
    useAuthStore();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [exchanging, setExchanging] = useState(false);

  // Restore persisted auth on mount (browser mode)
  useEffect(() => {
    if (!isElectron) {
      loadPersistedAuth();
    }
  }, [loadPersistedAuth]);

  // Listen for OAuth callback from main process (Electron mode)
  useEffect(() => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) return;

    const handler = (_event: unknown, data: {
      success: boolean;
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
      error?: string;
    }) => {
      if (data.success && data.accessToken && data.refreshToken && data.expiresAt) {
        setTokens(data.accessToken, data.refreshToken, data.expiresAt);
      } else {
        setError(data.error || 'Authentication failed');
      }
    };

    ipc.on('auth:callback', handler as (...args: unknown[]) => void);
    return () => ipc.removeListener('auth:callback', handler as (...args: unknown[]) => void);
  }, [setTokens, setError]);

  // Electron login
  const handleElectronLogin = useCallback(async () => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) return;

    setStatus('authenticating');
    const result = await ipc.invoke('auth:startLogin') as { success: boolean; error?: string };
    if (!result.success) {
      setError(result.error || 'Failed to start authentication');
    }
  }, [setStatus, setError]);

  // Browser login — step 1: open auth URL
  const handleBrowserLogin = useCallback(async () => {
    try {
      setStatus('authenticating');
      const pkce = await generatePKCE();
      setCodeVerifier(pkce.codeVerifier);
      const authUrl = getAuthorizationURL(pkce.codeChallenge, pkce.codeVerifier);
      window.open(authUrl, '_blank');
      setShowCodeInput(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start auth');
    }
  }, [setStatus, setError, setCodeVerifier]);

  // Browser login — step 2: exchange code for tokens
  const handleExchangeCode = useCallback(async () => {
    if (!codeInput.trim() || !codeVerifier) return;

    setExchanging(true);
    try {
      const tokens = await exchangeCodeForTokens(codeInput.trim(), codeVerifier);
      setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
      setShowCodeInput(false);
      setCodeInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to exchange code');
    } finally {
      setExchanging(false);
    }
  }, [codeInput, codeVerifier, setTokens, setError]);

  const handleLogout = useCallback(async () => {
    const ipc = window.electron?.ipcRenderer;
    if (ipc) {
      await ipc.invoke('auth:logout');
    }
    clearTokens();
    setShowCodeInput(false);
    setCodeInput('');
  }, [clearTokens]);

  // Authenticated state
  if (status === 'authenticated') {
    return (
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-green-400 hover:bg-rach-surface-light transition-colors"
      >
        <LogOut size={10} />
        Sign Out
      </button>
    );
  }

  // Browser mode: code input step
  if (!isElectron && showCodeInput) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExchangeCode()}
          placeholder="Paste code..."
          className="w-24 px-1.5 py-0.5 rounded text-[10px] bg-rach-bg border border-rach-border text-rach-text placeholder:text-rach-text-muted/50 focus:outline-none focus:border-rach-accent"
          autoFocus
        />
        <button
          onClick={handleExchangeCode}
          disabled={!codeInput.trim() || exchanging}
          className="px-1.5 py-0.5 rounded text-[10px] bg-rach-accent text-white hover:bg-rach-accent/80 disabled:opacity-50 transition-colors"
        >
          {exchanging ? '...' : 'Connect'}
        </button>
        <button
          onClick={() => { setShowCodeInput(false); setStatus('idle'); }}
          className="px-1 py-0.5 rounded text-[10px] text-rach-text-muted hover:text-rach-text transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Default: sign in button
  return (
    <button
      onClick={isElectron ? handleElectronLogin : handleBrowserLogin}
      disabled={status === 'authenticating'}
      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-rach-accent hover:bg-rach-surface-light transition-colors disabled:opacity-50"
    >
      <LogIn size={10} />
      {status === 'authenticating' ? 'Signing in...' : 'Sign in with Anthropic'}
    </button>
  );
}
