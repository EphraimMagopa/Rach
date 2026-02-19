import { useCallback, useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';

export function AuthButton(): React.JSX.Element {
  const { status, setTokens, clearTokens, setStatus, setError } = useAuthStore();

  // Listen for OAuth callback from main process
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

  const handleLogin = useCallback(async () => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) return;

    setStatus('authenticating');
    const result = await ipc.invoke('auth:startLogin') as { success: boolean; error?: string };
    if (!result.success) {
      setError(result.error || 'Failed to start authentication');
    }
  }, [setStatus, setError]);

  const handleLogout = useCallback(async () => {
    const ipc = window.electron?.ipcRenderer;
    if (ipc) {
      await ipc.invoke('auth:logout');
    }
    clearTokens();
  }, [clearTokens]);

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

  return (
    <button
      onClick={handleLogin}
      disabled={status === 'authenticating'}
      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-rach-accent hover:bg-rach-surface-light transition-colors disabled:opacity-50"
    >
      <LogIn size={10} />
      {status === 'authenticating' ? 'Signing in...' : 'Sign in with Anthropic'}
    </button>
  );
}
