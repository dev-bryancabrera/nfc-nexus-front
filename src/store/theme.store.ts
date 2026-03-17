import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  preview: string;   // gradient for the card preview
  dot: string;       // accent dot color
  vars: Record<string, string>;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'dark-nexus',
    name: 'Dark Nexus',
    description: 'El tema oscuro original de la plataforma',
    preview: 'linear-gradient(135deg,#050508,#13131e)',
    dot: '#6366f1',
    vars: {
      '--bg': '#050508',
      '--surface': '#0d0d14',
      '--surface2': '#13131e',
      '--border': 'rgba(255,255,255,0.07)',
      '--border-bright': 'rgba(99,102,241,0.4)',
      '--accent': '#6366f1',
      '--accent2': '#06ffa5',
      '--accent3': '#f059da',
      '--text': '#e8e8f0',
      '--text-dim': '#6b6b8a',
      '--text-mid': '#a0a0c0',
      '--danger': '#ff4757',
      '--warn': '#ffa502',
      '--glow': '0 0 40px rgba(99,102,241,0.15)',
    },
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Púrpura y magenta inspirado en la aurora boreal',
    preview: 'linear-gradient(135deg,#1a0533,#0a1628)',
    dot: '#f059da',
    vars: {
      '--bg': '#0a0118',
      '--surface': '#130225',
      '--surface2': '#1a0533',
      '--border': 'rgba(240,89,218,0.1)',
      '--border-bright': 'rgba(240,89,218,0.4)',
      '--accent': '#f059da',
      '--accent2': '#a78bfa',
      '--accent3': '#06ffa5',
      '--text': '#f0e8ff',
      '--text-dim': '#7a5c9a',
      '--text-mid': '#b09acc',
      '--danger': '#ff4757',
      '--warn': '#ffa502',
      '--glow': '0 0 40px rgba(240,89,218,0.15)',
    },
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Limpio y profesional en modo claro',
    preview: 'linear-gradient(135deg,#f8f8fc,#e8e8f0)',
    dot: '#6366f1',
    vars: {
      '--bg': '#f4f4f8',
      '--surface': '#ffffff',
      '--surface2': '#f0f0f6',
      '--border': 'rgba(0,0,0,0.08)',
      '--border-bright': 'rgba(99,102,241,0.4)',
      '--accent': '#6366f1',
      '--accent2': '#059669',
      '--accent3': '#d946ef',
      '--text': '#1a1a2e',
      '--text-dim': '#6b6b8a',
      '--text-mid': '#4a4a6a',
      '--danger': '#ef4444',
      '--warn': '#f59e0b',
      '--glow': '0 0 40px rgba(99,102,241,0.1)',
    },
  },
  {
    id: 'gold-luxury',
    name: 'Gold Luxury',
    description: 'Elegante y sofisticado con acentos dorados',
    preview: 'linear-gradient(135deg,#0a0800,#1a1400)',
    dot: '#ffd700',
    vars: {
      '--bg': '#080600',
      '--surface': '#100e00',
      '--surface2': '#1a1400',
      '--border': 'rgba(255,215,0,0.08)',
      '--border-bright': 'rgba(255,215,0,0.35)',
      '--accent': '#ffd700',
      '--accent2': '#f0a500',
      '--accent3': '#fffacd',
      '--text': '#fff8dc',
      '--text-dim': '#8a7a40',
      '--text-mid': '#c0a060',
      '--danger': '#ff4757',
      '--warn': '#ffa502',
      '--glow': '0 0 40px rgba(255,215,0,0.12)',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Profundo y sereno como el mar',
    preview: 'linear-gradient(135deg,#020c1b,#0a1a2e)',
    dot: '#00b4d8',
    vars: {
      '--bg': '#020c1b',
      '--surface': '#0a1628',
      '--surface2': '#0e2040',
      '--border': 'rgba(0,180,216,0.1)',
      '--border-bright': 'rgba(0,180,216,0.4)',
      '--accent': '#00b4d8',
      '--accent2': '#90e0ef',
      '--accent3': '#48cae4',
      '--text': '#caf0f8',
      '--text-dim': '#3a6a7a',
      '--text-mid': '#6a9aaa',
      '--danger': '#ff4757',
      '--warn': '#ffa502',
      '--glow': '0 0 40px rgba(0,180,216,0.15)',
    },
  },
  {
    id: 'medical-red',
    name: 'Medical Red',
    description: 'Profesional para perfiles médicos y de salud',
    preview: 'linear-gradient(135deg,#1a0000,#2d0000)',
    dot: '#ff4757',
    vars: {
      '--bg': '#100000',
      '--surface': '#1a0505',
      '--surface2': '#250808',
      '--border': 'rgba(255,71,87,0.08)',
      '--border-bright': 'rgba(255,71,87,0.4)',
      '--accent': '#ff4757',
      '--accent2': '#ff6b81',
      '--accent3': '#ff8fa0',
      '--text': '#ffe8ea',
      '--text-dim': '#7a3040',
      '--text-mid': '#b06070',
      '--danger': '#ff0020',
      '--warn': '#ffa502',
      '--glow': '0 0 40px rgba(255,71,87,0.15)',
    },
  },
];

function applyTheme(themeId: string) {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

interface ThemeState {
  activeTheme: string;
  setTheme: (id: string) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeTheme: 'dark-nexus',

      setTheme: (id: string) => {
        applyTheme(id);
        set({ activeTheme: id });
      },

      initTheme: () => {
        applyTheme(get().activeTheme);
      },
    }),
    {
      name: 'nexus-theme-v3',
      partialize: s => ({ activeTheme: s.activeTheme }),
    }
  )
);
