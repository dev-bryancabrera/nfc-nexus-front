import type { BlockDefinition, CardType } from '../types';

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  { type: 'social_links',  label: 'Links Sociales',    icon: '🔗', category: 'general' },
  { type: 'gallery',       label: 'Galería',            icon: '🖼️', category: 'general' },
  { type: 'video',         label: 'Video',              icon: '▶️', category: 'general' },
  { type: 'cta',           label: 'Botón CTA',          icon: '💳', category: 'general' },
  { type: 'text',          label: 'Texto libre',        icon: '📝', category: 'general' },
  { type: 'pdf',           label: 'PDF',                icon: '📄', category: 'general' },
  { type: 'faq',           label: 'FAQ',                icon: '❓', category: 'general' },
  { type: 'stats',         label: 'Estadísticas',       icon: '📊', category: 'general' },
  { type: 'map',           label: 'Mapa',               icon: '🗺️', category: 'general' },
  { type: 'hours',         label: 'Horarios',           icon: '🕐', category: 'general' },
  { type: 'reviews',       label: 'Reseñas',            icon: '⭐', category: 'general' },
  { type: 'wifi_qr',       label: 'WiFi QR',            icon: '📶', category: 'general' },
  { type: 'live_status',           label: 'Estado en vivo',   icon: '🟢', category: 'realtime' },
  { type: 'availability_calendar', label: 'Disponibilidad',   icon: '📅', category: 'realtime' },
  { type: 'spotify_track',    label: 'Canción Spotify',  icon: '🎵', category: 'music' },
  { type: 'spotify_playlist', label: 'Playlist Spotify', icon: '🎶', category: 'music' },
  { type: 'spotify_album',    label: 'Álbum Spotify',    icon: '💿', category: 'music' },
  { type: 'menu',       label: 'Menú Digital',    icon: '🍽️', category: 'restaurant', cardTypes: ['restaurant'] },
  { type: 'promotion',  label: 'Promoción',       icon: '🎉', category: 'restaurant', cardTypes: ['restaurant','business'] },
  { type: 'coupon',     label: 'Cupón',           icon: '🎟️', category: 'restaurant', cardTypes: ['restaurant','business'] },
  { type: 'order_link', label: 'Link de pedido',  icon: '🛒', category: 'restaurant', cardTypes: ['restaurant'] },
  { type: 'blood_type',         label: 'Tipo de Sangre',      icon: '🩸', category: 'medical', cardTypes: ['medical'] },
  { type: 'allergies',          label: 'Alergias',            icon: '⚠️', category: 'medical', cardTypes: ['medical'] },
  { type: 'emergency_contact',  label: 'Contacto Emergencia', icon: '🚨', category: 'medical', cardTypes: ['medical'] },
  { type: 'medical_conditions', label: 'Condiciones Médicas', icon: '🏥', category: 'medical', cardTypes: ['medical'] },
  { type: 'medications',        label: 'Medicamentos',        icon: '💊', category: 'medical', cardTypes: ['medical'] },
  { type: 'certificate', label: 'Certificado',  icon: '🏆', category: 'academic', cardTypes: ['academic'] },
  { type: 'course',      label: 'Curso',        icon: '📚', category: 'academic', cardTypes: ['academic'] },
  { type: 'achievement', label: 'Logro',        icon: '🌟', category: 'academic', cardTypes: ['academic'] },
  { type: 'project',     label: 'Proyecto',     icon: '🚀', category: 'academic', cardTypes: ['academic','portfolio','gamer'] },
  { type: 'skill_set',   label: 'Habilidades',  icon: '⚡', category: 'academic', cardTypes: ['academic','portfolio','personal','fitness'] },
  { type: 'gaming_profile', label: 'Perfil Gaming',  icon: '🎮', category: 'gamer', cardTypes: ['gamer'] },
  { type: 'gaming_stats',   label: 'Estadísticas',   icon: '📈', category: 'gamer', cardTypes: ['gamer'] },
  { type: 'stream_link',    label: 'Stream en vivo', icon: '📺', category: 'gamer', cardTypes: ['gamer','creator'] },
  { type: 'tournament',     label: 'Torneo',         icon: '🏆', category: 'gamer', cardTypes: ['gamer'] },
  { type: 'workout_plan',   label: 'Plan Entreno',       icon: '💪', category: 'fitness', cardTypes: ['fitness'] },
  { type: 'transformation', label: 'Transformación',     icon: '📸', category: 'fitness', cardTypes: ['fitness'] },
  { type: 'booking_link',   label: 'Reservar sesión',    icon: '📆', category: 'fitness', cardTypes: ['fitness','business','creator'] },
  { type: 'macro_tracker',  label: 'Macros / Nutrición', icon: '🥗', category: 'fitness', cardTypes: ['fitness'] },
  { type: 'social_stats',   label: 'Métricas Sociales', icon: '📣', category: 'creator', cardTypes: ['creator','personal'] },
  { type: 'latest_content', label: 'Últimos posts',     icon: '🎬', category: 'creator', cardTypes: ['creator'] },
  { type: 'merch_link',     label: 'Tienda / Merch',    icon: '🛍️', category: 'creator', cardTypes: ['creator','business'] },
  { type: 'collab_cta',     label: 'Colaborar conmigo', icon: '🤝', category: 'creator', cardTypes: ['creator','business'] },
  { type: 'qr_ticket',     label: 'Ticket QR',           icon: '🎫', category: 'access', cardTypes: ['access','event'] },
  { type: 'countdown',     label: 'Cuenta regresiva',    icon: '⏱️', category: 'access', cardTypes: ['access','event'] },
  { type: 'attendee_list', label: 'Lista asistentes',    icon: '👥', category: 'access', cardTypes: ['access','event'] },
  { type: 'check_in',      label: 'Check-in',            icon: '✅', category: 'access', cardTypes: ['access','event'] },
];

export function getBlocksForCard(cardType: CardType): BlockDefinition[] {
  return BLOCK_DEFINITIONS.filter(b => !b.cardTypes || b.cardTypes.includes(cardType));
}

export function groupBlocks(defs: BlockDefinition[]): Record<string, BlockDefinition[]> {
  return defs.reduce((acc, b) => {
    if (!acc[b.category]) acc[b.category] = [];
    acc[b.category].push(b);
    return acc;
  }, {} as Record<string, BlockDefinition[]>);
}

export const CATEGORY_LABELS: Record<string, string> = {
  general:    '⬡ General',
  realtime:   '🟢 Tiempo Real',
  music:      '🎵 Música',
  restaurant: '🍽️ Restaurante',
  medical:    '🏥 Médico',
  academic:   '🎓 Académico',
  gamer:      '🎮 Gaming',
  fitness:    '💪 Fitness',
  creator:    '🎭 Creator',
  access:     '🔐 Acceso / Eventos',
};
