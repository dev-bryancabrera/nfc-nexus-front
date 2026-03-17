// ═══════════════════════════════════════════════════════
//  AUTH SERVICE
// ═══════════════════════════════════════════════════════
import { apiClient } from '../lib/api-client';
import { supabase } from '../lib/supabase';
import type { AuthCallbackResponse, MeResponse } from '../interfaces/api.interfaces';

export const authService = {
  async googleLogin(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw error;
  },

  async handleCallback(accessToken: string, refreshToken: string): Promise<AuthCallbackResponse> {
    const { data } = await apiClient.post<AuthCallbackResponse>('/auth/google/callback', {
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return data;
  },

  async getMe(): Promise<MeResponse> {
    const { data } = await apiClient.get<MeResponse>('/auth/me');
    return data;
  },

  async refresh(refreshToken: string) {
    const { data } = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
    return data;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    await apiClient.post('/auth/logout').catch(() => {});
  },
};
