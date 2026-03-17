import { apiClient } from '../lib/api-client';
import type { AnalyticsOverviewResponse, ScansResponse, CardAnalyticsResponse } from '../interfaces/api.interfaces';

export const analyticsService = {
  async overview(): Promise<AnalyticsOverviewResponse> {
    const { data } = await apiClient.get<AnalyticsOverviewResponse>('/analytics/overview');
    return data;
  },
  async cardAnalytics(cardId: string, days = 30): Promise<CardAnalyticsResponse> {
    const { data } = await apiClient.get<CardAnalyticsResponse>(`/analytics/card/${cardId}`, { params: { days } });
    return data;
  },
  async recentScans(limit = 20): Promise<ScansResponse> {
    const { data } = await apiClient.get<ScansResponse>('/analytics/scans', { params: { limit } });
    return data;
  },
};