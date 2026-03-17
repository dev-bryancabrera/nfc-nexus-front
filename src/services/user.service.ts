import type { UserProfile } from '../types';
import type { ProfileResponse, UsernameCheckResponse } from '../interfaces/api.interfaces';
import { apiClient } from '@/lib/api-client';

export const usersService = {
    async getProfile(): Promise<UserProfile> {
        const { data } = await apiClient.get<ProfileResponse>('/users/profile');
        return data.profile;
    },
    async updateProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
        const { data } = await apiClient.put<ProfileResponse>('/users/profile', payload);
        return data.profile;
    },
    async checkUsername(username: string): Promise<boolean> {
        const { data } = await apiClient.get<UsernameCheckResponse>(`/users/check-username/${username}`);
        return data.available;
    },
};
