import { useCallback, useEffect, useState } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';

const isElectron = !!window.electron?.ipcRenderer;

export function AuthButton(): React.JSX.Element {
  const { status, setApiKey, clearApiKey, setStatus, setError, loadPersistedAuth } =
    useAuthStore();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyInput, setKeyInput] = useState('');

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
      error?: string;
    }) => {
      if (data.success && data.accessToken) {
        setApiKey(data.accessToken);
      } else {
        setError(data.error || 'Authentication failed');
      }
    };

    ipc.on('auth:callback', handler as (...args: unknown[]) => void);
    return () => ipc.removeListener('auth:callback', handler as (...args: unknown[]) => void);
  }, [setApiKey, setError]);

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

  // Browser login — show API key input
  const handleBrowserLogin = useCallback(() => {
    setShowKeyInput(true);
  }, []);

  // Browser login — save API key
  const handleSaveKey = useCallback(() => {
    const key = keyInput.trim();
    if (!key) return;
    setApiKey(key);
    setShowKeyInput(false);
    setKeyInput('');
  }, [keyInput, setApiKey]);

  const handleLogout = useCallback(async () => {
    const ipc = window.electron?.ipcRenderer;
    if (ipc) {
      await ipc.invoke('auth:logout');
    }
    clearApiKey();
    setShowKeyInput(false);
    setKeyInput('');
  }, [clearApiKey]);

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

  // Browser mode: API key input step
  if (!isElectron && showKeyInput) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
          placeholder="Paste Gemini API key..."
          className="w-40 px-1.5 py-0.5 rounded text-[10px] bg-rach-bg border border-rach-border text-rach-text placeholder:text-rach-text-muted/50 focus:outline-none focus:border-rach-accent"
          autoFocus
        />
        <button
          onClick={handleSaveKey}
          disabled={!keyInput.trim()}
          className="px-1.5 py-0.5 rounded text-[10px] bg-rach-accent text-white hover:bg-rach-accent/80 disabled:opacity-50 transition-colors"
        >
          Connect
        </button>
        <button
          onClick={() => { setShowKeyInput(false); setStatus('idle'); }}
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
      Add Gemini API Key
    </button>
  );
}
