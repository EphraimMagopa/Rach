import { create } from 'zustand';
import { refreshAccessToken, isTokenExpired } from '../services/oauth-service';

export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'error';

const STORAGE_KEY = 'rach-auth';

interface PersistedAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthState {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  codeVerifier: string | null;
  error: string | null;

  setTokens: (access: string, refresh: string, expiresAt: number) => void;
  clearTokens: () => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string) => void;
  setCodeVerifier: (verifier: string | null) => void;
  loadPersistedAuth: () => void;
  getValidToken: () => Promise<string | null>;
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function persistAuth(tokens: PersistedAuth): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    // localStorage may be unavailable
  }
}

function clearPersistedAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

function loadPersistedTokens(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAuth;
  } catch {
    return null;
  }
}

function scheduleRefresh(expiresAt: number, store: AuthState): void {
  if (refreshTimer) clearTimeout(refreshTimer);

  const msUntilRefresh = Math.max(0, expiresAt - Date.now() - 5 * 60 * 1000);
  refreshTimer = setTimeout(async () => {
    const { refreshToken } = store;
    if (!refreshToken) return;
    try {
      const tokens = await refreshAccessToken(refreshToken);
      store.setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
    } catch {
      // Refresh failed — user will need to re-authenticate
    }
  }, msUntilRefresh);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  codeVerifier: null,
  error: null,

  setTokens: (accessToken, refreshToken, expiresAt) => {
    set({ accessToken, refreshToken, expiresAt, status: 'authenticated', error: null });
    persistAuth({ accessToken, refreshToken, expiresAt });
    scheduleRefresh(expiresAt, get());
  },

  clearTokens: () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    clearPersistedAuth();
    set({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      codeVerifier: null,
      status: 'idle',
      error: null,
    });
  },

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),
  setCodeVerifier: (codeVerifier) => set({ codeVerifier }),

  loadPersistedAuth: () => {
    const tokens = loadPersistedTokens();
    if (!tokens) return;

    // If token is still valid (or refreshable), restore it
    if (!isTokenExpired(tokens.expiresAt)) {
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        status: 'authenticated',
      });
      scheduleRefresh(tokens.expiresAt, get());
    } else if (tokens.refreshToken) {
      // Token expired but we have a refresh token — try refreshing
      refreshAccessToken(tokens.refreshToken)
        .then((newTokens) => {
          get().setTokens(newTokens.accessToken, newTokens.refreshToken, newTokens.expiresAt);
        })
        .catch(() => {
          clearPersistedAuth();
        });
    } else {
      clearPersistedAuth();
    }
  },

  getValidToken: async () => {
    const state = get();
    if (!state.accessToken) return null;

    if (state.expiresAt && !isTokenExpired(state.expiresAt)) {
      return state.accessToken;
    }

    // Try refresh
    if (state.refreshToken) {
      try {
        const tokens = await refreshAccessToken(state.refreshToken);
        state.setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
        return tokens.accessToken;
      } catch {
        state.clearTokens();
        return null;
      }
    }

    return null;
  },
}));
