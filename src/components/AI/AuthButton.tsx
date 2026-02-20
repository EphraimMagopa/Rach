import { WifiOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { ravelClient } from '../../services/ravel-client';
import { useCallback } from 'react';

export function AuthButton(): React.JSX.Element {
  const { status } = useAuthStore();

  const handleReconnect = useCallback(() => {
    ravelClient.connect().catch(() => {
      // Status updates handled by the client's onStatusChange
    });
  }, []);

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 text-[10px] text-green-400">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Connected
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 text-[10px] text-yellow-400">
        <Loader2 size={10} className="animate-spin" />
        Connecting...
      </div>
    );
  }

  // disconnected or error
  return (
    <button
      onClick={handleReconnect}
      className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-red-400 hover:bg-rach-surface-light transition-colors"
      title={status === 'error' ? 'Connection error — click to reconnect' : 'Disconnected — click to reconnect'}
    >
      <WifiOff size={10} />
      Reconnect
    </button>
  );
}
