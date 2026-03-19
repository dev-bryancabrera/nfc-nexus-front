import { useState, useEffect, useRef } from 'react';
import type { CardBlock } from '../../../types';
import { publicService } from '../../../services/public.service';

interface Props { block: CardBlock; slug: string }

export default function BlockRenderer({ block, slug }: Props) {
  const cfg = block.config;
  const track = (action: string) => publicService.recordScan(slug, action);

  switch (block.type) {

    /* ═══ SPOTIFY ═══════════════════════════════════════════════════════════ */
    case 'spotify_track':
    case 'spotify_playlist':
    case 'spotify_album': {
      const spotifyUrl = cfg.spotify_url as string;
      if (!spotifyUrl) return null;

      // Convierte URL normal a embed URL
      // https://open.spotify.com/track/ID → https://open.spotify.com/embed/track/ID
      const embedUrl = spotifyUrl
        .replace('open.spotify.com/intl-es/', 'open.spotify.com/')
        .replace('open.spotify.com/track/', 'open.spotify.com/embed/track/')
        .replace('open.spotify.com/playlist/', 'open.spotify.com/embed/playlist/')
        .replace('open.spotify.com/album/', 'open.spotify.com/embed/album/')
        .split('?')[0]; // elimina el ?si=... del final

      return (
        <div className="rounded-2xl overflow-hidden">
          <iframe
            src={embedUrl}
            width="100%"
            height={block.type === 'spotify_track' ? 80 : 352}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="border-0 rounded-2xl"
          />
        </div>
      );
    }

    /* ═══ MENU ══════════════════════════════════════════════════════════════ */
    case 'menu': {
      const categories = (cfg.categories as { name: string; items: { name: string; price: string; description?: string; emoji?: string }[] }[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
            <span>🍽️</span><span className="font-syne font-bold text-sm">Menú</span>
          </div>
          {categories.map((cat, i) => (
            <div key={i}>
              <div className="px-4 py-2 text-[10px] font-mono tracking-widest uppercase text-[var(--text-dim)] bg-[rgba(255,255,255,0.02)]">{cat.name}</div>
              {cat.items.map((item, j) => (
                <div key={j} className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{item.emoji || '🍽️'}</span>
                    <div><div className="text-sm font-medium">{item.name}</div>
                      {item.description && <div className="text-[10px] text-[var(--text-dim)]">{item.description}</div>}</div>
                  </div>
                  <div className="font-mono text-sm text-[#06ffa5] font-bold">{item.price}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    /* ═══ RESTAURANT ════════════════════════════════════════════════════════ */
    case 'promotion':
      return (
        <div className="rounded-2xl overflow-hidden border border-[rgba(255,165,2,0.3)]" style={{ background: 'linear-gradient(135deg,rgba(255,165,2,0.08),rgba(255,71,87,0.05))' }}>
          <div className="p-4">
            {cfg.discount && <div className="inline-block bg-[#ffa502] text-black text-xs font-bold px-2 py-0.5 rounded-lg mb-2">{cfg.discount as string}</div>}
            <div className="font-syne font-bold text-base">{cfg.title as string || ''}</div>
            <div className="text-sm text-[#a0a0c0] mt-1">{cfg.description as string || ''}</div>
            {cfg.valid_until && <div className="text-[10px] font-mono text-[var(--text-dim)] mt-2">Válido hasta: {cfg.valid_until as string}</div>}
          </div>
        </div>
      );
    case 'coupon':
      return (
        <div className="bg-[#13131e] border-2 border-dashed border-[rgba(99,102,241,0.4)] rounded-2xl p-4 text-center">
          <div className="text-2xl mb-2">🎟️</div>
          <div className="font-mono text-2xl font-bold text-[#6366f1] tracking-widest mb-1">{cfg.code as string || ''}</div>
          <div className="text-sm font-bold text-[#06ffa5]">{cfg.discount as string || ''}</div>
          <div className="text-xs text-[var(--text-dim)] mt-1">{cfg.description as string || ''}</div>
          {cfg.valid_until && <div className="text-[9px] font-mono text-[var(--text-dim)] mt-2">Expira: {cfg.valid_until as string}</div>}
          <button onClick={() => navigator.clipboard.writeText(cfg.code as string || '')}
            className="mt-3 text-xs bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)] rounded-lg px-3 py-1.5 text-[#6366f1] hover:bg-[rgba(99,102,241,0.2)] transition-all">
            Copiar código
          </button>
        </div>
      );
    case 'order_link':
      return (
        <a href={cfg.url as string} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
          className="flex items-center justify-center gap-2 bg-[rgba(255,165,2,0.1)] border border-[rgba(255,165,2,0.3)] text-[#ffa502] rounded-2xl py-4 font-bold text-sm hover:bg-[rgba(255,165,2,0.2)] transition-all active:scale-95">
          🛒 {cfg.label as string || 'Pedir ahora'}
        </a>
      );

    /* ═══ MEDICAL ════════════════════════════════════════════════════════════ */
    case 'blood_type':
      return (
        <div className="bg-[rgba(255,71,87,0.08)] border border-[rgba(255,71,87,0.3)] rounded-2xl p-4 flex items-center gap-4">
          <div className="text-4xl font-syne font-extrabold text-[#ff4757]">{cfg.blood_type as string || ''}</div>
          <div><div className="text-xs font-mono text-[#ff4757] uppercase tracking-wider">Tipo de sangre</div>
            {cfg.notes && <div className="text-xs text-[var(--text-dim)] mt-0.5">{cfg.notes as string || ''}</div>}</div>
        </div>
      );
    case 'allergies': {
      const allergies = (cfg.allergies as string[]) || [];
      const sev = cfg.severity as string;
      const sevColor = sev === 'anaphylaxis' ? 'text-[#ff4757]' : sev === 'severe' ? 'text-[#ffa502]' : 'text-[#06ffa5]';
      return (
        <div className="bg-[#13131e] border border-[rgba(255,165,2,0.3)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span><span className="font-bold text-sm">Alergias</span>
            {sev && <span className={`text-[10px] font-mono uppercase ${sevColor}`}>{sev}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allergies.map((a, i) => <span key={i} className="text-xs bg-[rgba(255,165,2,0.1)] border border-[rgba(255,165,2,0.3)] text-[#ffa502] px-2 py-0.5 rounded-lg">{a}</span>)}
          </div>
          {cfg.notes && <div className="text-xs text-[var(--text-dim)] mt-2">{cfg.notes as string || ''}</div>}
        </div>
      );
    }
    case 'emergency_contact':
      return (
        <a href={`tel:${cfg.phone}`} onClick={() => track('called')}
          className="flex items-center gap-3 bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.3)] rounded-2xl p-4 hover:bg-[rgba(255,71,87,0.2)] transition-all active:scale-95">
          <div className="w-10 h-10 rounded-full bg-[rgba(255,71,87,0.2)] flex items-center justify-center text-xl flex-shrink-0">🚨</div>
          <div>
            <div className="text-xs font-mono text-[#ff4757] uppercase tracking-wider">Contacto de Emergencia</div>
            <div className="font-bold text-sm">{cfg.name as string || ''}</div>
            <div className="text-xs text-[var(--text-dim)]">{cfg.relationship as string || ''} · {cfg.phone as string || ''}</div>
          </div>
        </a>
      );
    case 'medical_conditions': {
      const conditions = (cfg.conditions as string[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><span className="text-xl">🏥</span><span className="font-bold text-sm">Condiciones Médicas</span></div>
          <div className="space-y-1">{conditions.map((c, i) => <div key={i} className="text-sm flex items-center gap-2"><span className="text-[#06ffa5]">•</span>{c}</div>)}</div>
          {cfg.notes && <div className="text-xs text-[var(--text-dim)] mt-2 border-t border-[rgba(255,255,255,0.05)] pt-2">{cfg.notes as string || ''}</div>}
        </div>
      );
    }
    case 'medications': {
      const meds = (cfg.medications as { name: string; dose: string; frequency: string }[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><span className="text-xl">💊</span><span className="font-bold text-sm">Medicamentos</span></div>
          {meds.map((m, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
              <span className="text-sm font-medium">{m.name}</span>
              <span className="text-xs font-mono text-[var(--text-dim)]">{m.dose} · {m.frequency}</span>
            </div>
          ))}
        </div>
      );
    }

    /* ═══ ACADEMIC ═══════════════════════════════════════════════════════════ */
    case 'certificate':
      return (
        <a href={cfg.credential_url as string || '#'} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
          className="flex items-center gap-3 bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)] rounded-2xl p-4 hover:border-[rgba(99,102,241,0.4)] transition-all active:scale-95">
          <span className="text-3xl flex-shrink-0">🏆</span>
          <div><div className="font-bold text-sm">{cfg.title as string || ''}</div>
            <div className="text-xs text-[var(--text-dim)]">{cfg.issuer as string || ''}</div>
            {cfg.date && <div className="text-[10px] font-mono text-[#06ffa5] mt-0.5">{cfg.date as string || ''}</div>}</div>
        </a>
      );
    case 'course':
      return (
        <a href={cfg.url as string || '#'} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
          className="flex items-center gap-3 bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 hover:border-[rgba(99,102,241,0.3)] transition-all">
          <span className="text-2xl flex-shrink-0">📚</span>
          <div><div className="font-bold text-sm">{cfg.title as string || ''}</div>
            <div className="text-xs text-[var(--text-dim)]">{cfg.platform as string || ''}</div></div>
        </a>
      );
    case 'achievement':
      return (
        <div className="bg-[rgba(6,255,165,0.05)] border border-[rgba(6,255,165,0.2)] rounded-2xl p-4 flex items-start gap-3">
          <span className="text-3xl">{cfg.icon as string || '🌟'}</span>
          <div><div className="font-bold text-sm">{cfg.title as string}</div>
            <div className="text-xs text-[var(--text-dim)] mt-0.5">{cfg.description as string}</div></div>
        </div>
      );
    /* El caso 'project' antiguo fue movido abajo para unificarse con el nuevo diseño de portafolio */
    case 'skill_set': {
      const skills = (cfg.skills as { name: string; level: number }[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="font-bold text-sm mb-3 flex items-center gap-2"><span>⚡</span>{cfg.category as string || 'Habilidades'}</div>
          <div className="space-y-2">
            {skills.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-0.5"><span>{s.name}</span><span className="text-[#06ffa5]">{'★'.repeat(s.level)}{'☆'.repeat(5 - s.level)}</span></div>
                <div className="h-1 bg-[#0d0d14] rounded-full"><div className="h-full rounded-full" style={{ width: `${s.level * 20}%`, background: 'linear-gradient(90deg,#6366f1,#06ffa5)' }} /></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    /* ═══ GAMING 🎮 ══════════════════════════════════════════════════════════ */
    case 'gaming_profile': {
      const statusColors: Record<string, string> = { online: '#06ffa5', ingame: '#6366f1', away: '#ffa502', offline: '#6b6b8a' };
      const statusLabels: Record<string, string> = { online: 'En línea', ingame: 'En partida', away: 'Ausente', offline: 'Offline' };
      const status = cfg.status as string || 'online';
      const platformIcons: Record<string, string> = { pc: '🖥️', psn: '🎮', xbox: '🟩', nintendo: '🔴', mobile: '📱' };
      return (
        <div className="bg-[#13131e] border border-[rgba(99,102,241,0.2)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{(platformIcons as any)[cfg.platform as string] || '🎮'}</span>
              <div>
                <div className="font-mono font-bold text-sm">{cfg.username as string || ''}</div>
                <div className="text-xs text-[var(--text-dim)]">{cfg.main_game as string || ''}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <div className="w-2 h-2 rounded-full" style={{ background: statusColors[status] || '#6b6b8a' }} />
                <span className="text-[10px] font-mono" style={{ color: statusColors[status] }}>{statusLabels[status] || status}</span>
              </div>
              {cfg.rank && <div className="text-xs font-bold text-[#f059da] mt-0.5">{cfg.rank as string || ''}</div>}
            </div>
          </div>
          {cfg.role && <div className="text-[10px] font-mono text-[var(--text-dim)] bg-[#050508] px-2 py-1 rounded-lg inline-block">{cfg.role as string || ''}</div>}
        </div>
      );
    }
    case 'gaming_stats': {
      const stats = (cfg.stats as { label: string; value: string; icon?: string }[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-3">📈 Estadísticas</div>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="bg-[#050508] rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{s.icon || '📊'}</div>
                <div className="font-mono font-bold text-base text-[#6366f1]">{s.value}</div>
                <div className="text-[10px] text-[var(--text-dim)]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'stream_link': {
      const platformUrls: Record<string, string> = { twitch: 'https://twitch.tv/', youtube: 'https://youtube.com/@', kick: 'https://kick.com/', tiktok: 'https://tiktok.com/@' };
      const platform = cfg.platform as string || 'twitch';
      const isLive = cfg.is_live as boolean;
      return (
        <a href={`${platformUrls[platform] || 'https://'}${cfg.username}`} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
          className={`flex items-center gap-3 rounded-2xl p-4 border transition-all active:scale-95 ${isLive ? 'bg-[rgba(255,71,87,0.1)] border-[rgba(255,71,87,0.4)] hover:bg-[rgba(255,71,87,0.2)]' : 'bg-[#13131e] border-[rgba(255,255,255,0.07)] hover:border-[rgba(99,102,241,0.3)]'}`}>
          <div className="relative">
            <span className="text-2xl">📺</span>
            {isLive && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff4757] rounded-full animate-pulse border border-[#050508]" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isLive && <span className="text-[10px] font-mono bg-[#ff4757] text-white px-1.5 py-0.5 rounded font-bold tracking-wider">EN VIVO</span>}
              <span className="font-bold text-sm">{cfg.username as string}</span>
            </div>
            {cfg.stream_title && <div className="text-xs text-[var(--text-dim)] mt-0.5 truncate">{cfg.stream_title as string}</div>}
          </div>
          <span className="text-[10px] font-mono text-[var(--text-dim)] capitalize">{platform}</span>
        </a>
      );
    }
    case 'tournament':
      return (
        <div className="bg-[rgba(240,89,218,0.05)] border border-[rgba(240,89,218,0.2)] rounded-2xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-bold text-sm">{cfg.name as string}</div>
              <div className="text-xs text-[var(--text-dim)]">{cfg.game as string}</div>
              {cfg.date && <div className="text-[10px] font-mono text-[var(--text-dim)] mt-1">{cfg.date as string}</div>}
            </div>
            {cfg.result && <div className="text-right"><div className="text-xs font-mono bg-[rgba(240,89,218,0.15)] text-[#f059da] px-2 py-1 rounded-lg">{cfg.result as string}</div></div>}
          </div>
          {cfg.url && <a href={cfg.url as string} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')} className="mt-2 text-[10px] text-[#6366f1] hover:underline inline-block">Ver VOD →</a>}
        </div>
      );

    /* ═══ FITNESS 💪 ═════════════════════════════════════════════════════════ */
    case 'workout_plan': {
      const days = (cfg.days as { day: string; exercises: string[] }[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
            <span>💪</span><span className="font-syne font-bold text-sm">{cfg.plan_name as string || 'Plan de Entrenamiento'}</span>
          </div>
          {days.map((d, i) => (
            <div key={i} className="border-b border-[rgba(255,255,255,0.04)] last:border-0">
              <div className="px-4 py-2 text-[10px] font-mono tracking-widest uppercase text-[#06ffa5] bg-[rgba(6,255,165,0.03)]">{d.day}</div>
              <div className="px-4 py-2 space-y-1">
                {d.exercises.filter(Boolean).map((ex, j) => <div key={j} className="text-xs text-[var(--text-dim)] flex items-center gap-2"><span className="text-[#6366f1]">▸</span>{ex}</div>)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    case 'transformation':
      return (
        <div className="bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.2)] rounded-2xl p-4">
          <div className="text-sm font-bold mb-3">{cfg.title as string}</div>
          <div className="flex justify-around mb-3">
            {cfg.start_weight && <div className="text-center"><div className="font-mono text-xl font-bold text-[var(--text-dim)]">{cfg.start_weight as string}</div><div className="text-[10px] text-[var(--text-dim)]">Inicio</div></div>}
            <div className="flex items-center text-2xl">→</div>
            {cfg.end_weight && <div className="text-center"><div className="font-mono text-xl font-bold text-[#06ffa5]">{cfg.end_weight as string}</div><div className="text-[10px] text-[var(--text-dim)]">Final</div></div>}
          </div>
          {cfg.duration && <div className="text-center text-[10px] font-mono text-[var(--text-dim)]">En {cfg.duration as string}</div>}
          {cfg.description && <div className="text-xs text-[var(--text-dim)] mt-2 border-t border-[rgba(255,255,255,0.05)] pt-2">{cfg.description as string}</div>}
        </div>
      );
    case 'booking_link':
      return (
        <a href={cfg.url as string || '#'} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
          className="flex items-center justify-between bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.3)] rounded-2xl p-4 hover:border-[rgba(99,102,241,0.5)] hover:bg-[rgba(99,102,241,0.12)] transition-all active:scale-95">
          <div><div className="font-bold text-sm">{cfg.service as string}</div>
            {cfg.price && <div className="text-xs text-[#06ffa5] font-mono mt-0.5">{cfg.price as string}</div>}</div>
          <div className="text-sm font-bold text-[#6366f1]">📆 Reservar</div>
        </a>
      );
    case 'macro_tracker': {
      const macros = [{ l: 'Proteínas', v: cfg.protein as number || 0, c: '#ff6348', u: 'g' }, { l: 'Carbos', v: cfg.carbs as number || 0, c: '#ffa502', u: 'g' }, { l: 'Grasas', v: cfg.fats as number || 0, c: '#06ffa5', u: 'g' }];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm">🥗 Macros diarios</span>
            {cfg.calories && <span className="font-mono text-sm text-[#ffa502] font-bold">{cfg.calories as number} kcal</span>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {macros.map(m => (
              <div key={m.l} className="bg-[#050508] rounded-xl p-2.5 text-center">
                <div className="font-mono font-bold text-base" style={{ color: m.c }}>{m.v}{m.u}</div>
                <div className="text-[10px] text-[var(--text-dim)]">{m.l}</div>
              </div>
            ))}
          </div>
          {cfg.note && <div className="text-[10px] font-mono text-[var(--text-dim)] mt-2 text-center">{cfg.note as string}</div>}
        </div>
      );
    }

    /* ═══ CREATOR 🎭 ═════════════════════════════════════════════════════════ */
    case 'social_stats': {
      const platforms = (cfg.platforms as { name: string; followers: string; icon: string }[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-3">📣 Métricas</div>
          <div className="space-y-2.5">
            {platforms.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span>{p.icon}</span><span className="text-sm">{p.name}</span></div>
                <span className="font-mono font-bold text-[#6366f1]">{p.followers}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'latest_content': {
      const items = (cfg.items as { title: string; url: string; type: string }[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center gap-2">
            <span>🎬</span><span className="font-syne font-bold text-sm">Últimos contenidos</span>
          </div>
          {items.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
              className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-all">
              <span className="text-lg flex-shrink-0">{item.type === 'video' ? '▶️' : item.type === 'reel' ? '🎵' : item.type === 'podcast' ? '🎙️' : '📸'}</span>
              <span className="text-sm truncate">{item.title}</span>
            </a>
          ))}
        </div>
      );
    }
    case 'merch_link':
      return (
        <a href={cfg.url as string || '#'} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
          className="flex items-center justify-between bg-[rgba(240,89,218,0.08)] border border-[rgba(240,89,218,0.3)] rounded-2xl p-4 hover:bg-[rgba(240,89,218,0.12)] transition-all active:scale-95">
          <div>
            <div className="font-bold text-sm">🛍️ {cfg.store_name as string || 'Mi tienda'}</div>
            {cfg.discount_code && <div className="text-[10px] font-mono text-[#f059da] mt-0.5">Código: {cfg.discount_code as string}</div>}
          </div>
          <span className="text-[#f059da] text-sm font-bold">→</span>
        </a>
      );
    case 'collab_cta':
      return (
        <a href={`mailto:${cfg.email}`} onClick={() => track('emailed')}
          className="block bg-gradient-to-r from-[rgba(99,102,241,0.1)] to-[rgba(240,89,218,0.1)] border border-[rgba(99,102,241,0.3)] rounded-2xl p-4 hover:border-[rgba(99,102,241,0.5)] transition-all active:scale-95">
          <div className="font-syne font-bold text-base mb-1">🤝 {cfg.title as string || '¿Colaboramos?'}</div>
          <div className="text-xs text-[var(--text-dim)] mb-3">{cfg.description as string}</div>
          <div className="inline-block text-xs font-bold bg-[rgba(99,102,241,0.2)] text-[#6366f1] px-3 py-1.5 rounded-xl">
            {cfg.btn_label as string || 'Contactar para collabs'}
          </div>
        </a>
      );

    /* ═══ ACCESS / EVENTS 🔐 ═════════════════════════════════════════════════ */
    case 'qr_ticket': {
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden">
          <div className="bg-[rgba(99,102,241,0.1)] px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
            <span className="font-syne font-bold text-sm">🎫 {cfg.event_name as string}</span>
            <span className="text-xs bg-[rgba(6,255,165,0.15)] text-[#06ffa5] border border-[rgba(6,255,165,0.2)] px-2 py-0.5 rounded-full font-mono">{cfg.ticket_type as string || 'General'}</span>
          </div>
          <div className="p-4 text-center">
            <div className="font-mono text-xl font-bold tracking-widest text-[#6366f1] mb-1">{cfg.ticket_code as string}</div>
            {cfg.event_date && <div className="text-xs text-[var(--text-dim)] font-mono">{new Date(cfg.event_date as string).toLocaleString('es')}</div>}
            {cfg.venue && <div className="text-xs text-[var(--text-dim)] mt-1">📍 {cfg.venue as string}</div>}
          </div>
        </div>
      );
    }
    case 'countdown': {
      function CountdownBlock({ cfg }: { cfg: Record<string, unknown> }) {
        const [diff, setDiff] = useState({ d: 0, h: 0, m: 0, s: 0, ended: false });
        useEffect(() => {
          const calc = () => {
            const target = new Date(cfg.target_date as string).getTime();
            const now = Date.now();
            const rem = Math.max(0, target - now);
            if (rem === 0) { setDiff({ d: 0, h: 0, m: 0, s: 0, ended: true }); return; }
            setDiff({ d: Math.floor(rem / 86400000), h: Math.floor((rem % 86400000) / 3600000), m: Math.floor((rem % 3600000) / 60000), s: Math.floor((rem % 60000) / 1000), ended: false });
          };
          calc(); const t = setInterval(calc, 1000); return () => clearInterval(t);
        }, [cfg.target_date]);
        if (diff.ended) return <div className="bg-[rgba(6,255,165,0.1)] border border-[rgba(6,255,165,0.3)] rounded-2xl p-4 text-center font-syne font-bold text-[#06ffa5]">🎉 {cfg.end_message as string || '¡Comenzó!'}</div>;
        return (
          <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 text-center">
            <div className="text-xs font-mono text-[var(--text-dim)] mb-3">{cfg.title as string}</div>
            <div className="grid grid-cols-4 gap-2">
              {[['d', 'Días'], ['h', 'Horas'], ['m', 'Min'], ['s', 'Seg']].map(([k, l]) => (
                <div key={k} className="bg-[#050508] rounded-xl py-2">
                  <div className="font-mono text-2xl font-bold text-[#6366f1]">{String((diff as Record<string, unknown>)[k]).padStart(2, '0')}</div>
                  <div className="text-[9px] text-[var(--text-dim)]">{l}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return <CountdownBlock cfg={cfg} />;
    }
    case 'attendee_list': {
      const attendees = (cfg.attendees as string[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm">👥 {cfg.title as string || 'Asistentes'}</span>
            <span className="text-[10px] font-mono bg-[rgba(99,102,241,0.1)] text-[#6366f1] px-2 py-0.5 rounded-full">{attendees.length} confirmados</span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {attendees.map((a, i) => <div key={i} className="flex items-center gap-2 text-sm"><span className="text-[#06ffa5] text-xs">✓</span>{a}</div>)}
          </div>
        </div>
      );
    }
    case 'check_in': {
      const statusConfig: { [k: string]: { c: string; label: string } } = { pending: { c: 'text-[#ffa502]', label: '⏳ Pendiente' }, confirmed: { c: 'text-[#06ffa5]', label: '✅ Confirmado' }, denied: { c: 'text-[#ff4757]', label: '❌ Denegado' } };
      const status = cfg.status as string || 'pending';
      const sc = statusConfig[status] || statusConfig.pending;
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div><div className="font-bold text-sm">{cfg.event as string}</div>
              <div className="font-mono text-xs text-[var(--text-dim)] mt-0.5">{cfg.access_code as string}</div></div>
            <div className={`text-sm font-bold ${sc.c}`}>{sc.label}</div>
          </div>
        </div>
      );
    }

    /* ═══ REAL-TIME 🟢 ════════════════════════════════════════════════════════ */
    case 'live_status': {
      const statusMap: { [k: string]: { c: string; dot: string; label: string } } = {
        available: { c: 'text-[#06ffa5]', dot: '#06ffa5', label: 'Disponible' },
        busy: { c: 'text-[#ff4757]', dot: '#ff4757', label: 'Ocupado' },
        away: { c: 'text-[#ffa502]', dot: '#ffa502', label: 'Ausente' },
        dnd: { c: 'text-[#ff4757]', dot: '#ff4757', label: 'No molestar' },
        custom: { c: 'text-[#6366f1]', dot: '#6366f1', label: '' },
      };
      const status = cfg.status as string || 'available';
      const sc = statusMap[status] || statusMap.available;
      return (
        <div className="bg-[rgba(6,255,165,0.05)] border border-[rgba(6,255,165,0.15)] rounded-2xl p-4 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: sc.dot }} />
            <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: sc.dot }} />
          </div>
          <div>
            <div className={`font-bold text-sm ${sc.c}`}>{sc.label || cfg.message as string}</div>
            {cfg.message && status !== 'custom' && <div className="text-xs text-[var(--text-dim)] mt-0.5">{cfg.message as string}</div>}
            {cfg.until && <div className="text-[10px] font-mono text-[var(--text-dim)]">Hasta {new Date(cfg.until as string).toLocaleString('es', { hour: '2-digit', minute: '2-digit' })}</div>}
          </div>
        </div>
      );
    }
    case 'availability_calendar': {
      const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
      const available = (cfg.available_days as number[]) || [0, 1, 2, 3, 4];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm">📅 Disponibilidad</span>
            {cfg.from && cfg.to && <span className="text-xs font-mono text-[#06ffa5]">{cfg.from as string} – {cfg.to as string}</span>}
          </div>
          <div className="grid grid-cols-7 gap-1 mb-3">
            {DAY_LABELS.map((d, i) => (
              <div key={d} className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${available.includes(i) ? 'bg-[rgba(99,102,241,0.15)] border-[rgba(99,102,241,0.4)] text-[#6366f1]' : 'bg-[#050508] border-[rgba(255,255,255,0.04)] text-[var(--text-dim)]'}`}>{d}</div>
            ))}
          </div>
          {cfg.booking_url && (
            <a href={cfg.booking_url as string} target="_blank" rel="noreferrer"
              className="block text-center text-xs font-bold bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)] text-[#6366f1] py-2 rounded-xl hover:bg-[rgba(99,102,241,0.2)] transition-all">
              📆 Reservar una sesión
            </a>
          )}
        </div>
      );
    }

    /* ═══ GENERAL ════════════════════════════════════════════════════════════ */
    case 'social_links':
      return (
        <div className="grid grid-cols-5 gap-2">
          {['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'tiktok', 'github', 'twitch', 'discord', 'snapchat', 'pinterest'].map(p => {
            const url = cfg[p] as string;

            const socialIcons: { [k: string]: { svg: string; color: string } } = {
              facebook: { color: '#1877F2', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` },
              instagram: { color: '#E1306C', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#E1306C" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>` },
              linkedin: { color: '#0A66C2', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` },
              twitter: { color: '#ffffff', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
              youtube: { color: '#FF0000', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>` },
              tiktok: { color: '#ffffff', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>` },
              github: { color: '#ffffff', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>` },
              twitch: { color: '#9146FF', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#9146FF" d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>` },
              discord: { color: '#5865F2', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#5865F2" d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>` },
              snapchat: { color: '#FFFC00', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#FFFC00" d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.104-.464-.166-.552-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/></svg>` },
              pinterest: { color: '#E60023', svg: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#E60023" d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>` },
            };

            const icon = socialIcons[p];

            const toSvgUrl = (svg: string) =>
              `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

            return url ? (
              <a
                key={p}
                href={url}
                target="_blank"
                rel="noreferrer"
                onClick={() => track('clicked_link')}
                className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-xl py-3 flex items-center justify-center hover:border-[rgba(99,102,241,0.3)] transition-all"
              >
                <img
                  src={toSvgUrl(icon.svg)}
                  width={22}
                  height={22}
                  alt={p}
                />
              </a>
            ) : null;
          })
          }
        </div >
      );
    case 'cta':
      return (
        <a href={cfg.url as string || '#'} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
          className="flex items-center justify-center gap-2 bg-[#6366f1] rounded-2xl py-4 text-sm font-bold text-white hover:bg-[#4f52d9] transition-all active:scale-95">
          {cfg.icon as string || ''} {cfg.label as string || 'Contactar'}
        </a>
      );
    case 'hours': {
      const hours = (cfg.hours as { day: string; time: string }[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><span className="text-xl">🕐</span><span className="font-bold text-sm">Horarios</span></div>
          {hours.map((h, i) => (
            <div key={i} className="flex justify-between text-xs py-1.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">
              <span className="text-[var(--text-dim)]">{h.day}</span><span className="font-mono">{h.time}</span>
            </div>
          ))}
        </div>
      );
    }
    case 'map':
      return (
        <a href={`https://maps.google.com/?q=${encodeURIComponent(cfg.address as string || '')}`} target="_blank" rel="noreferrer"
          className="flex items-center gap-3 bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 hover:border-[rgba(99,102,241,0.3)] transition-all">
          <span className="text-2xl">🗺️</span><span className="text-sm">{cfg.address as string}</span>
        </a>
      );
    case 'reviews':
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="text-yellow-400 text-sm mb-2">★★★★★</div>
          <div className="text-sm text-[#a0a0c0] leading-relaxed italic">{cfg.text as string}</div>
          <div className="text-xs text-[var(--text-dim)] mt-2">— {cfg.author as string}</div>
        </div>
      );
    case 'text':
      return <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 text-sm leading-relaxed text-[#a0a0c0]">{cfg.content as string}</div>;

    case 'gallery': {
      const title = cfg.title as string || 'Galería';
      const photos = (cfg.photos as { url: string; caption?: string }[]) || [];
      if (photos.length === 0) return null;
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="font-syne font-bold text-sm mb-3">🖼️ {title}</div>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden aspect-square border border-[rgba(255,255,255,0.04)]">
                <img src={p.url || ''} alt={p.caption || ''} className="w-full h-full object-cover" />
                {p.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {p.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'project': {
      const items = (cfg.items as { title: string; subtitle?: string; url: string; image_url?: string; description?: string }[]) || [];
      if (items.length === 0) return null;
      return (
        <div className="space-y-3">
          {items.map((p, i) => (
            <a key={i} href={p.url || '#'} target={p.url ? '_blank' : undefined} rel="noreferrer" onClick={() => p.url && track('clicked_link')}
              className="block bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden hover:border-[var(--accent)] transition-all group relative">
              {p.image_url && (
                <div className="w-full h-32 relative overflow-hidden">
                  <img src={p.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#13131e] to-transparent opacity-90" />
                </div>
              )}
              <div className="p-4" style={{ marginTop: p.image_url ? '-48px' : '0' }}>
                <div className="relative z-10 flex items-end justify-between gap-2">
                  <div>
                    <h3 className="font-syne font-bold text-base text-white group-hover:text-[var(--accent)] transition-colors">{p.title || 'Proyecto'}</h3>
                    {p.subtitle && <p className="text-[10px] font-mono tracking-widest text-[var(--accent)] mt-1">{p.subtitle}</p>}
                  </div>
                  {p.url && <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">↗</div>}
                </div>
              </div>
            </a>
          ))}
        </div>
      );
    }

    case 'video': {
      const rawUrl = cfg.url as string || '';
      if (!rawUrl) return null;
      const getEmbedUrl = (url: string) => {
        const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
        const vm = url.match(/vimeo\.com\/(\d+)/);
        if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
        return '';
      };
      const embedUrl = getEmbedUrl(rawUrl);
      if (!embedUrl) return null;

      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          {cfg.title && <div className="font-syne font-bold text-sm mb-1">▶️ {cfg.title as string || ''}</div>}
          {cfg.description && <div className="text-xs text-[var(--text-dim)] mb-3">{cfg.description as string || ''}</div>}
          <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.04)]">
            <iframe src={embedUrl} width="100%" height="200" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen className="border-0 bg-black" />
          </div>
        </div>
      );
    }

    case 'pdf': {
      if (!cfg.url) return null;
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[rgba(255,71,87,0.1)] text-[#ff4757] flex items-center justify-center text-2xl border border-[rgba(255,71,87,0.2)]">📄</div>
          <div>
            <div className="font-syne font-bold text-sm">{cfg.title as string || 'Documento PDF'}</div>
            <div className="text-[10px] text-[var(--text-dim)] mt-0.5">{cfg.allow_download ? 'Documento descargable' : 'Solo lectura'}</div>
          </div>
          <a href={cfg.url as string} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
            className="w-full flex items-center justify-center gap-2 bg-[#ff4757] rounded-xl py-3 text-sm font-bold text-white hover:bg-[#ff2e43] transition-all active:scale-95">
            {cfg.btn_label as string || 'Ver Documento'}
          </a>
        </div>
      );
    }

    case 'faq': {
      const faqs = (cfg.faqs as { question: string; answer: string }[]) || [];
      if (faqs.length === 0) return null;
      function FAQItem({ q, a }: { q: string, a: string }) {
        const [open, setOpen] = useState(false);
        return (
          <div className="border-b border-[rgba(255,255,255,0.04)] last:border-0">
            <button className="w-full flex items-center justify-between py-3 text-left hover:text-[#6366f1] transition-colors" onClick={() => setOpen(!open)}>
              <span className="font-bold text-sm pr-4">{q}</span>
              <span className={`text-[var(--text-dim)] transition-transform ${open ? 'rotate-180 text-[#6366f1]' : ''}`}>▼</span>
            </button>
            {open && <div className="pb-3 text-xs text-[var(--text-dim)] leading-relaxed">{a}</div>}
          </div>
        );
      }
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="font-syne font-bold text-sm mb-2">❓ {cfg.title as string || 'Preguntas Frecuentes'}</div>
          <div>
            {faqs.map((f, i) => <FAQItem key={i} q={f.question} a={f.answer} />)}
          </div>
        </div>
      );
    }

    case 'stats': {
      const items = (cfg.items as { label: string; value: string; icon?: string }[]) || [];
      if (items.length === 0) return null;
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="font-syne font-bold text-sm mb-3">📊 {cfg.title as string || 'Estadísticas'}</div>
          <div className="grid grid-cols-2 gap-2">
            {items.map((s, i) => (
              <div key={i} className="bg-[#050508] rounded-xl p-3 text-center border border-[rgba(255,255,255,0.04)]">
                <div className="text-xl mb-1">{s.icon || '📈'}</div>
                <div className="font-mono font-bold text-base text-[#6366f1]">{s.value}</div>
                <div className="text-[10px] text-[var(--text-dim)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'wifi_qr': {
      function WifiQRBlock({ cfg }: { cfg: Record<string, unknown> }) {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const [revealed, setRevealed] = useState(false);
        const [copied, setCopied] = useState(false);
        const ssid = cfg.ssid as string || '';
        const password = cfg.password as string || '';
        const security = cfg.security as string || 'WPA';
        const hidden = cfg.hidden as boolean || false;

        const wifiString = security === 'nopass'
          ? `WIFI:T:nopass;S:${ssid};;`
          : `WIFI:T:${security};S:${ssid};P:${password};${hidden ? 'H:true;' : ''}`;

        useEffect(() => {
          if (!revealed || !canvasRef.current || !ssid) return;
          import('qrcode').then(QRCode => {
            QRCode.toCanvas(canvasRef.current!, wifiString, {
              width: 220, margin: 2,
              color: { dark: '#ffffff', light: '#0d0d14' }
            }).catch(() => { });
          });
        }, [revealed, ssid, password, security, hidden]);

        const copyPass = () => {
          navigator.clipboard.writeText(password);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        };

        if (!ssid) return null;

        return (
          <div className="bg-[#13131e] border border-[rgba(99,102,241,0.25)] rounded-2xl overflow-hidden">
            {/* Header: siempre visible */}
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>📶</span>
                <div>
                  <div className="font-syne font-bold text-sm">Conectarse al WiFi</div>
                  <div className="text-[10px] text-[var(--text-dim)] font-mono">{ssid}</div>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-[rgba(99,102,241,0.1)] text-[#6366f1] border border-[rgba(99,102,241,0.2)] px-2 py-0.5 rounded-full">
                {security === 'nopass' ? 'Abierta' : security}
              </span>
            </div>

            {/* Botón principal: revelar QR */}
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="w-full flex flex-col items-center gap-3 p-6 hover:bg-[rgba(99,102,241,0.05)] transition-all active:scale-95 group"
              >
                {/* Icono con efecto glow animado */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] flex items-center justify-center text-3xl group-hover:bg-[rgba(99,102,241,0.25)] group-hover:border-[rgba(99,102,241,0.5)] transition-all"
                    style={{ boxShadow: '0 0 20px rgba(99,102,241,0.15)' }}>
                    📲
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-[#6366f1] group-hover:text-[#818cf8] transition-colors">
                    Mostrar QR para conectar
                  </div>
                  <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
                    Pulsa para ver el código QR de acceso
                  </div>
                </div>
              </button>
            ) : (
              /* QR revealed */
              <div className="p-4 flex flex-col items-center gap-4" style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="bg-[#0d0d14] rounded-2xl p-4 border border-[rgba(255,255,255,0.07)]"
                  style={{ boxShadow: '0 0 30px rgba(99,102,241,0.1)' }}>
                  <canvas ref={canvasRef} className="rounded-lg block" />
                </div>

                {security !== 'nopass' && password && (
                  <button onClick={copyPass}
                    className="w-full flex items-center justify-between bg-[#050508] rounded-xl px-3 py-2.5 border border-[rgba(255,255,255,0.06)] hover:border-[rgba(99,102,241,0.3)] transition-all active:scale-95">
                    <div>
                      <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider text-left">Contraseña</div>
                      <div className="text-sm font-mono mt-0.5 text-left">{'•'.repeat(Math.min(password.length, 12))}</div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${copied ? 'bg-[rgba(6,255,165,0.15)] text-[#06ffa5] border border-[rgba(6,255,165,0.2)]' : 'bg-[rgba(99,102,241,0.1)] text-[#6366f1] border border-[rgba(99,102,241,0.2)]'}`}>
                      {copied ? '✓ Copiada' : 'Copiar'}
                    </span>
                  </button>
                )}

                <div className="flex items-center gap-2 w-full">
                  <p className="text-[10px] text-[var(--text-dim)] text-center flex-1">
                    Escanea con la cámara de tu móvil para conectarte
                  </p>
                  <button onClick={() => setRevealed(false)}
                    className="text-[10px] text-[var(--text-dim)] hover:text-[var(--text)] font-mono px-2 py-1 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-all flex-shrink-0">
                    Ocultar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }
      return <WifiQRBlock cfg={cfg} />;
    }

    default:
      return null;
  }
}
