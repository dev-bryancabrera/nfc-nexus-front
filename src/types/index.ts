// ═══════════════════════════════════════════════════════
//  FRONTEND TYPES — mirrors backend domain
// ═══════════════════════════════════════════════════════

export type CardType =
  | 'personal' | 'business' | 'portfolio'
  | 'restaurant' | 'medical' | 'academic'
  | 'event' | 'product' | 'blank'
  | 'gamer' | 'fitness' | 'creator' | 'access';

export type CardStatus = 'active' | 'draft' | 'archived';
export type DomainMode = 'path' | 'subdomain';
export type DeviceType = 'ios' | 'android' | 'desktop' | 'other';
export type ScanAction = 'viewed' | 'saved_contact' | 'clicked_link' | 'called' | 'emailed';

// ─── Block types ─────────────────────────────────────────
export type BlockType =
  | 'social_links' | 'gallery' | 'video' | 'cta' | 'text' | 'pdf' | 'faq' | 'stats' | 'map' | 'hours' | 'reviews' | 'wifi_qr'
  | 'spotify_track' | 'spotify_playlist' | 'spotify_album'
  | 'menu' | 'promotion' | 'coupon' | 'order_link'
  | 'blood_type' | 'allergies' | 'emergency_contact' | 'medical_conditions' | 'medications'
  | 'certificate' | 'course' | 'achievement' | 'project' | 'skill_set'
  // Gamer
  | 'gaming_profile' | 'gaming_stats' | 'stream_link' | 'tournament'
  // Fitness
  | 'workout_plan' | 'transformation' | 'booking_link' | 'macro_tracker'
  // Creator
  | 'social_stats' | 'latest_content' | 'merch_link' | 'collab_cta'
  // Access / Events
  | 'qr_ticket' | 'countdown' | 'attendee_list' | 'check_in'
  // Real-time
  | 'live_status' | 'availability_calendar';

export interface CardBlock {
  id: string;
  type: BlockType;
  position: number;
  visible: boolean;
  config: Record<string, unknown>;
}

export interface CardSettings {
  save_contact_btn: boolean;
  analytics_enabled: boolean;
  whatsapp_button: boolean;
  auto_dark_mode: boolean;
  animations: boolean;
  seo_enabled: boolean;
  password_protected: boolean;
  show_emergency_banner: boolean;
  realtime_enabled: boolean;
  // Gamer
  show_online_status: boolean;
  // Access
  require_check_in: boolean;
}

export const DEFAULT_SETTINGS: CardSettings = {
  save_contact_btn: true, analytics_enabled: true, whatsapp_button: true,
  auto_dark_mode: true, animations: true, seo_enabled: true,
  password_protected: false, show_emergency_banner: false, realtime_enabled: false,
  show_online_status: false, require_check_in: false,
};

export interface Card {
  id: string; user_id: string; name: string; slug: string;
  type: CardType; status: CardStatus; theme: string;
  blocks: CardBlock[]; settings: CardSettings;
  cover_gradient: string; full_name: string | null; role: string | null;
  company: string | null; bio: string | null; avatar_emoji: string | null;
  phone: string | null; email: string | null; website: string | null;
  address: string | null; public_url: string;
  scan_count: number; created_at: string; updated_at: string;
}

export interface UserProfile {
  id: string; user_id: string; username: string;
  full_name: string | null; email: string | null;
  avatar_url: string | null; avatar_emoji: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  domain_mode: DomainMode; custom_domain: string | null;
  created_at: string; updated_at: string;
}

export interface AuthSession {
  access_token: string; refresh_token: string; expires_at?: number;
}

export interface AnalyticsOverview {
  total_scans: number; saved_contacts: number; conversion_rate: number;
  active_cards: number; total_cards: number;
  devices: { ios: number; android: number; desktop: number; other: number };
  cards_summary: { id: string; name: string; scan_count: number; status: string; type: string }[];
}

export interface Scan {
  id: string; card_id: string; device_type: DeviceType;
  action: ScanAction; ip_city: string | null; created_at: string;
  cards?: { name: string };
}

// ─── Block definition for editor ─────────────────────────
export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: string;
  category: 'general' | 'music' | 'restaurant' | 'medical' | 'academic' | 'realtime' | 'gamer' | 'fitness' | 'creator' | 'access';
  cardTypes?: CardType[]; // undefined = available for all
}
