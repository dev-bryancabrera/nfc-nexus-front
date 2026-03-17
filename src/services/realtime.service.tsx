// ═══════════════════════════════════════════════════════
//  REALTIME SERVICE — actualización instantánea de bloques
// ═══════════════════════════════════════════════════════
import { useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../lib/api-client';
import axios from 'axios';
import type { CardBlock } from '../types';

const publicClient = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api' });

export const realtimeService = {
  /** Actualiza el estado en vivo de un bloque (requiere auth) */
  async updateLiveStatus(cardId: string, blockId: string, payload: {
    status: 'available' | 'busy' | 'away' | 'dnd' | 'custom';
    message?: string;
    until?: string | null;
  }): Promise<CardBlock> {
    const { data } = await apiClient.patch<{ block: CardBlock }>(`/realtime/${cardId}/block/${blockId}`, payload);
    return data.block;
  },

  /** Actualiza disponibilidad de calendario (requiere auth) */
  async updateAvailability(cardId: string, blockId: string, payload: {
    available_days: number[];
    from: string;
    to: string;
    booking_url?: string;
  }): Promise<CardBlock> {
    const { data } = await apiClient.patch<{ block: CardBlock }>(`/realtime/${cardId}/block/${blockId}`, payload);
    return data.block;
  },

  /** Obtiene solo los bloques realtime de una card (sin auth, para perfil público) */
  async getStatus(cardId: string): Promise<{ blocks: CardBlock[]; updated_at: string }> {
    const { data } = await publicClient.get<{ blocks: CardBlock[]; updated_at: string }>(`/realtime/${cardId}/status`);
    return data;
  },
};

// ═══════════════════════════════════════════════════════
//  HOOK: useRealtimeBlocks
//  Hace polling liviano al endpoint público cada N seg
//  y actualiza los bloques de tiempo real en la vista pública.
// ═══════════════════════════════════════════════════════
export function useRealtimeBlocks(
  cardId: string | undefined,
  enabled: boolean,
  onUpdate: (blocks: CardBlock[]) => void,
  intervalMs = 15000 // 15 segundos por defecto
) {
  const lastUpdated = useRef<string>('');

  const poll = useCallback(async () => {
    if (!cardId) return;
    try {
      const { blocks, updated_at } = await realtimeService.getStatus(cardId);
      if (updated_at !== lastUpdated.current) {
        lastUpdated.current = updated_at;
        onUpdate(blocks);
      }
    } catch {
      // Silently fail — realtime is best-effort
    }
  }, [cardId, onUpdate]);

  useEffect(() => {
    if (!enabled || !cardId) return;
    poll(); // Initial fetch
    const interval = setInterval(poll, intervalMs);
    return () => clearInterval(interval);
  }, [enabled, cardId, intervalMs, poll]);
}

// ═══════════════════════════════════════════════════════
//  WIDGET: LiveStatusUpdater
//  Componente rápido para actualizar el estado en vivo
//  desde el dashboard (sin abrir el editor completo).
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import toast from 'react-hot-toast';

type LiveStatus = 'available' | 'busy' | 'away' | 'dnd' | 'custom';

const STATUS_OPTIONS: { value: LiveStatus; label: string; color: string }[] = [
  { value: 'available', label: '🟢 Disponible',   color: 'border-[rgba(6,255,165,0.4)] bg-[rgba(6,255,165,0.08)] text-[#06ffa5]' },
  { value: 'busy',      label: '🔴 Ocupado',       color: 'border-[rgba(255,71,87,0.4)] bg-[rgba(255,71,87,0.08)] text-[#ff4757]' },
  { value: 'away',      label: '🟡 Ausente',       color: 'border-[rgba(255,165,2,0.4)] bg-[rgba(255,165,2,0.08)] text-[#ffa502]' },
  { value: 'dnd',       label: '⛔ No molestar',   color: 'border-[rgba(255,71,87,0.4)] bg-[rgba(255,71,87,0.08)] text-[#ff4757]' },
  { value: 'custom',    label: '✏️ Personalizado', color: 'border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.08)] text-[#6366f1]' },
];

interface LiveStatusUpdaterProps {
  cardId: string;
  blockId: string;
  currentStatus?: LiveStatus;
  currentMessage?: string;
  onSaved?: (block: CardBlock) => void;
}

export function LiveStatusUpdater({ cardId, blockId, currentStatus = 'available', currentMessage = '', onSaved }: LiveStatusUpdaterProps) {
  const [status, setStatus] = useState<LiveStatus>(currentStatus);
  const [message, setMessage] = useState(currentMessage);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const block = await realtimeService.updateLiveStatus(cardId, blockId, { status, message });
      toast.success('Estado actualizado en tiempo real ⚡');
      onSaved?.(block);
    } catch { toast.error('Error actualizando estado'); }
    finally { setSaving(false); }
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#06ffa5] animate-pulse" />
        <span className="text-sm font-bold">Estado en tiempo real</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {STATUS_OPTIONS.map(opt => (
          <button key={opt.value} onClick={() => setStatus(opt.value)}
            className={`px-4 py-2.5 rounded-xl border text-left text-sm font-semibold transition-all ${status === opt.value ? opt.color : 'border-[var(--border)] bg-bg text-[var(--text-dim)] hover:border-accent/30'}`}>
            {opt.label}
          </button>
        ))}
      </div>
      <div>
        <label className="label">Mensaje de estado</label>
        <input className="input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Disponible para nuevos proyectos..." maxLength={120} />
      </div>
      <button className="btn btn-primary w-full justify-center" onClick={save} disabled={saving}>
        {saving ? 'Actualizando...' : '⚡ Actualizar ahora'}
      </button>
      <p className="text-[10px] font-mono text-[var(--text-dim)] text-center">Cambio visible en el perfil público en ~15 segundos</p>
    </div>
  );
}
