import { create } from 'zustand';
import type { ConnectionStatus } from '../services/ravel-client';

interface AuthState {
  status: ConnectionStatus;
  error: string | null;
  sessionId: string | null;

  setStatus: (status: ConnectionStatus) => void;
  setSessionId: (id: string | null) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'disconnected',
  error: null,
  sessionId: null,

  setStatus: (status) => set({ status, ...(status !== 'error' && { error: null }) }),
  setSessionId: (sessionId) => set({ sessionId }),
  setError: (error) => set({ error, status: error ? 'error' : 'disconnected' }),
}));
