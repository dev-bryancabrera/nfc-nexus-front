import axios from 'axios';
import type { PublicCardResponse } from '../interfaces/api.interfaces';

const publicClient = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api' });

export const publicService = {
    async getCard(slug: string): Promise<PublicCardResponse> {
        const { data } = await publicClient.get<PublicCardResponse>(`/public/card/${slug}`);
        return data;
    },
    async getCardBySubdomain(): Promise<PublicCardResponse> {
        const { data } = await publicClient.get<PublicCardResponse>('/public/subdomain');
        return data;
    },
    async recordScan(slug: string, action = 'viewed'): Promise<void> {
        await publicClient.post(`/public/card/${slug}/scan`, { action }).catch(() => { });
    },
};