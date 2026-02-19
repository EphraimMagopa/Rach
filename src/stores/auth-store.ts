import { create } from 'zustand';

export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'error';

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  error: string | null;

  setTokens: (access: string, refresh: string, expiresAt: number) => void;
  clearTokens: () => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'idle',
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  error: null,

  setTokens: (accessToken, refreshToken, expiresAt) =>
    set({ accessToken, refreshToken, expiresAt, status: 'authenticated', error: null }),

  clearTokens: () =>
    set({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      status: 'idle',
      error: null,
    }),

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),
}));
