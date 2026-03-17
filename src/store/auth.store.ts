import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, AuthSession } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshTokenValue: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, session: AuthSession) => void;
  clear: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null, accessToken: null, refreshTokenValue: null, isAuthenticated: false,

      setAuth: (user, session) => set({
        user, accessToken: session.access_token,
        refreshTokenValue: session.refresh_token, isAuthenticated: true,
      }),

      clear: () => set({ user: null, accessToken: null, refreshTokenValue: null, isAuthenticated: false }),

      refresh: async () => {
        const rt = get().refreshTokenValue;
        if (!rt) throw new Error('No refresh token');
        const data = await authService.refresh(rt);
        set({ accessToken: data.session.access_token, refreshTokenValue: data.session.refresh_token });
      },
    }),
    {
      name: 'nexus-auth-v3',
      partialize: s => ({ accessToken: s.accessToken, refreshTokenValue: s.refreshTokenValue, user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
