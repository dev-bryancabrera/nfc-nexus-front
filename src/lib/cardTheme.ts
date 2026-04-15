// ═══════════════════════════════════════════════════════
//  cardTheme.ts — Visual style tokens for NFC cards
//  Shared between EditorPage (PhonePreview) and PublicProfilePage
// ═══════════════════════════════════════════════════════

export type CardStyle = 'dark' | 'glass' | 'neon' | 'gradient' | 'light' | 'aurora';
export type ProfileLayout = 'standard' | 'centered' | 'banner' | 'minimal';
export type FontStyle = 'outfit' | 'syne' | 'inter' | 'playfair' | 'mono';

export interface CardThemeTokens {
  fontFamily: string;
  googleFontsUrl: string | null;
  pageBackground: (accent: string) => string;
  textColor: string;
  textDimColor: string;
  bioColor: string;
  blockBg: string;
  blockBorder: (accent: string) => string;
  avatarBg: (accent: string) => string;
  avatarBorderColor: string;
  isLight: boolean;
  hasAurora: boolean;
  hasNeonGlow: boolean;
}

const FONTS: Record<FontStyle, { family: string; url: string | null }> = {
  outfit:   { family: 'Outfit, sans-serif',           url: null },
  syne:     { family: 'Syne, sans-serif',             url: null },
  inter:    { family: 'Inter, sans-serif',            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
  playfair: { family: '"Playfair Display", serif',    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap' },
  mono:     { family: '"JetBrains Mono", monospace',  url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap' },
};

export function getCardTheme(cardStyle?: string, fontStyle?: string): CardThemeTokens {
  const font = FONTS[(fontStyle as FontStyle) || 'outfit'] ?? FONTS.outfit;

  switch (cardStyle as CardStyle) {
    case 'glass':
      return {
        fontFamily: font.family,
        googleFontsUrl: font.url,
        pageBackground: () => '#0c0c1a',
        textColor: '#e8e8f0',
        textDimColor: 'rgba(232,232,240,0.55)',
        bioColor: 'rgba(200,200,220,0.75)',
        blockBg: 'rgba(255,255,255,0.06)',
        blockBorder: accent => `1px solid ${accent}35`,
        avatarBg: accent => `${accent}25`,
        avatarBorderColor: '#0c0c1a',
        isLight: false,
        hasAurora: false,
        hasNeonGlow: false,
      };

    case 'neon':
      return {
        fontFamily: font.family,
        googleFontsUrl: font.url,
        pageBackground: () => '#04040c',
        textColor: '#e8e8f0',
        textDimColor: '#7070a0',
        bioColor: '#a0a0c0',
        blockBg: 'transparent',
        blockBorder: accent => `1px solid ${accent}80`,
        avatarBg: accent => `${accent}18`,
        avatarBorderColor: '#04040c',
        isLight: false,
        hasAurora: false,
        hasNeonGlow: true,
      };

    case 'gradient':
      return {
        fontFamily: font.family,
        googleFontsUrl: font.url,
        pageBackground: accent => `linear-gradient(160deg, ${accent} 0%, #050508 58%)`,
        textColor: '#ffffff',
        textDimColor: 'rgba(255,255,255,0.65)',
        bioColor: 'rgba(255,255,255,0.80)',
        blockBg: 'rgba(0,0,0,0.22)',
        blockBorder: () => '1px solid rgba(255,255,255,0.15)',
        avatarBg: () => 'rgba(255,255,255,0.2)',
        avatarBorderColor: 'transparent',
        isLight: false,
        hasAurora: false,
        hasNeonGlow: false,
      };

    case 'light':
      return {
        fontFamily: font.family,
        googleFontsUrl: font.url,
        pageBackground: () => '#f4f4ee',
        textColor: '#1a1a2e',
        textDimColor: '#6b6b8a',
        bioColor: '#4a4a6a',
        blockBg: '#ffffff',
        blockBorder: accent => `1px solid ${accent}30`,
        avatarBg: accent => `${accent}20`,
        avatarBorderColor: '#f4f4ee',
        isLight: true,
        hasAurora: false,
        hasNeonGlow: false,
      };

    case 'aurora':
      return {
        fontFamily: font.family,
        googleFontsUrl: font.url,
        pageBackground: () => '#050508',
        textColor: '#e8e8f0',
        textDimColor: '#6b6b8a',
        bioColor: '#a0a0c0',
        blockBg: 'rgba(255,255,255,0.04)',
        blockBorder: accent => `1px solid ${accent}28`,
        avatarBg: accent => `${accent}22`,
        avatarBorderColor: '#050508',
        isLight: false,
        hasAurora: true,
        hasNeonGlow: false,
      };

    default: // 'dark'
      return {
        fontFamily: font.family,
        googleFontsUrl: font.url,
        pageBackground: () => '#050508',
        textColor: '#e8e8f0',
        textDimColor: '#6b6b8a',
        bioColor: '#a0a0c0',
        blockBg: '#13131e',
        blockBorder: () => '1px solid rgba(255,255,255,0.07)',
        avatarBg: accent => `linear-gradient(135deg,#f059da,${accent})`,
        avatarBorderColor: '#050508',
        isLight: false,
        hasAurora: false,
        hasNeonGlow: false,
      };
  }
}
