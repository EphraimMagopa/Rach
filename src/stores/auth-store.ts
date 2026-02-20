import { create } from 'zustand';

export type AuthStatus = 'idle' | 'authenticating' | 'authenticated' | 'error';

const STORAGE_KEY = 'rach-auth';

interface AuthState {
  status: AuthStatus;
  apiKey: string | null;
  error: string | null;

  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string) => void;
  loadPersistedAuth: () => void;
  getValidToken: () => Promise<string | null>;
}

function persistApiKey(apiKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKey }));
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

function loadPersistedKey(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.apiKey || null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  apiKey: null,
  error: null,

  setApiKey: (apiKey) => {
    set({ apiKey, status: 'authenticated', error: null });
    persistApiKey(apiKey);
  },

  clearApiKey: () => {
    clearPersistedAuth();
    set({ apiKey: null, status: 'idle', error: null });
  },

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),

  loadPersistedAuth: () => {
    const apiKey = loadPersistedKey();
    if (apiKey) {
      set({ apiKey, status: 'authenticated' });
    }
  },

  getValidToken: async () => {
    return get().apiKey;
  },
}));
