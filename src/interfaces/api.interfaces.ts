// ═══════════════════════════════════════════════════════
//  INTERFACES — API response contracts
// ═══════════════════════════════════════════════════════
import type { Card, UserProfile, AuthSession, AnalyticsOverview, Scan } from '../types';

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface CardsListResponse { cards: Card[] }
export interface CardResponse { card: Card }
export interface CardUrlResponse { url: string; slug: string; domain_mode: string }
export interface PublishCardResponse { card: Card; url: string }

export interface AuthCallbackResponse {
  user: { id: string; email: string };
  profile: UserProfile;
  session: AuthSession;
}

export interface MeResponse {
  user: { id: string; email: string };
  profile: UserProfile;
}

export interface ProfileResponse { profile: UserProfile }

export interface AnalyticsOverviewResponse extends AnalyticsOverview {}
export interface ScansResponse { scans: Scan[] }
export interface CardAnalyticsResponse {
  card: { id: string; name: string; type: string; status: string; scan_count: number };
  scans_by_day: Record<string, number>;
  actions: Record<string, number>;
  devices: { ios: number; android: number; desktop: number; other: number };
  total: number;
  saved_contacts: number;
  conversion_rate: number;
  scans: Scan[];
}

export interface PublicCardResponse {
  card: Card & { has_password: boolean };
}

export interface ScanResponse { ok: boolean }
export interface UsernameCheckResponse { available: boolean }
