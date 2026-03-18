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
      const url = cfg.embed_url as string;
      if (!url) return null;
      return (
        <div className="rounded-2xl overflow-hidden">
          <iframe src={url} width="100%" height={block.type === 'spotify_track' ? 80 : 352}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" className="border-0 rounded-2xl" />
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
            <div className="font-syne font-bold text-base">{cfg.title as string}</div>
            <div className="text-sm text-[#a0a0c0] mt-1">{cfg.description as string}</div>
            {cfg.valid_until && <div className="text-[10px] font-mono text-[var(--text-dim)] mt-2">Válido hasta: {cfg.valid_until as string}</div>}
          </div>
        </div>
      );
    case 'coupon':
      return (
        <div className="bg-[#13131e] border-2 border-dashed border-[rgba(99,102,241,0.4)] rounded-2xl p-4 text-center">
          <div className="text-2xl mb-2">🎟️</div>
          <div className="font-mono text-2xl font-bold text-[#6366f1] tracking-widest mb-1">{cfg.code as string}</div>
          <div className="text-sm font-bold text-[#06ffa5]">{cfg.discount as string}</div>
          <div className="text-xs text-[var(--text-dim)] mt-1">{cfg.description as string}</div>
          {cfg.valid_until && <div className="text-[9px] font-mono text-[var(--text-dim)] mt-2">Expira: {cfg.valid_until as string}</div>}
          <button onClick={() => navigator.clipboard.writeText(cfg.code as string)}
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
          <div className="text-4xl font-syne font-extrabold text-[#ff4757]">{cfg.blood_type as string}</div>
          <div><div className="text-xs font-mono text-[#ff4757] uppercase tracking-wider">Tipo de sangre</div>
            {cfg.notes && <div className="text-xs text-[var(--text-dim)] mt-0.5">{cfg.notes as string}</div>}</div>
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
          {cfg.notes && <div className="text-xs text-[var(--text-dim)] mt-2">{cfg.notes as string}</div>}
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
            <div className="font-bold text-sm">{cfg.name as string}</div>
            <div className="text-xs text-[var(--text-dim)]">{cfg.relationship as string} · {cfg.phone as string}</div>
          </div>
        </a>
      );
    case 'medical_conditions': {
      const conditions = (cfg.conditions as string[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><span className="text-xl">🏥</span><span className="font-bold text-sm">Condiciones Médicas</span></div>
          <div className="space-y-1">{conditions.map((c, i) => <div key={i} className="text-sm flex items-center gap-2"><span className="text-[#06ffa5]">•</span>{c}</div>)}</div>
          {cfg.notes && <div className="text-xs text-[var(--text-dim)] mt-2 border-t border-[rgba(255,255,255,0.05)] pt-2">{cfg.notes as string}</div>}
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
          <div><div className="font-bold text-sm">{cfg.title as string}</div>
            <div className="text-xs text-[var(--text-dim)]">{cfg.issuer as string}</div>
            {cfg.date && <div className="text-[10px] font-mono text-[#06ffa5] mt-0.5">{cfg.date as string}</div>}</div>
        </a>
      );
    case 'course':
      return (
        <a href={cfg.url as string || '#'} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
          className="flex items-center gap-3 bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4 hover:border-[rgba(99,102,241,0.3)] transition-all">
          <span className="text-2xl flex-shrink-0">📚</span>
          <div><div className="font-bold text-sm">{cfg.title as string}</div>
            <div className="text-xs text-[var(--text-dim)]">{cfg.platform as string}</div></div>
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
    case 'project': {
      const tech = (cfg.tech_stack as string[]) || [];
      return (
        <div className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
          <div className="font-bold text-sm mb-1">{cfg.title as string}</div>
          <div className="text-xs text-[var(--text-dim)] mb-2">{cfg.description as string}</div>
          {tech.length > 0 && <div className="flex flex-wrap gap-1 mb-2">
            {tech.map((t, i) => <span key={i} className="text-[10px] bg-[rgba(99,102,241,0.1)] text-[#6366f1] border border-[rgba(99,102,241,0.2)] px-2 py-0.5 rounded-full">{t}</span>)}
          </div>}
          <div className="flex gap-3">
            {cfg.url && <a href={cfg.url as string} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')} className="text-[10px] text-[#06ffa5] hover:underline">🔗 Demo</a>}
            {cfg.repo_url && <a href={cfg.repo_url as string} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')} className="text-[10px] text-[#6366f1] hover:underline">⌨ Repo</a>}
          </div>
        </div>
      );
    }
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
              <span className="text-2xl">{platformIcons[cfg.platform as string] || '🎮'}</span>
              <div>
                <div className="font-mono font-bold text-sm">{cfg.username as string}</div>
                <div className="text-xs text-[var(--text-dim)]">{cfg.main_game as string}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <div className="w-2 h-2 rounded-full" style={{ background: statusColors[status] || '#6b6b8a' }} />
                <span className="text-[10px] font-mono" style={{ color: statusColors[status] }}>{statusLabels[status] || status}</span>
              </div>
              {cfg.rank && <div className="text-xs font-bold text-[#f059da] mt-0.5">{cfg.rank as string}</div>}
            </div>
          </div>
          {cfg.role && <div className="text-[10px] font-mono text-[var(--text-dim)] bg-[#050508] px-2 py-1 rounded-lg inline-block">{cfg.role as string}</div>}
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
          {['instagram', 'linkedin', 'twitter', 'youtube', 'tiktok', 'github', 'twitch', 'discord', 'snapchat', 'pinterest'].map(p => {
            const url = cfg[p] as string;
            const icons: { [k: string]: string } = { instagram: '📷', linkedin: '💼', twitter: '🐦', youtube: '▶️', tiktok: '🎵', github: '⌨️', twitch: '🎮', discord: '💬', snapchat: '👻', pinterest: '📌' };
            return url ? <a key={p} href={url} target="_blank" rel="noreferrer" onClick={() => track('clicked_link')}
              className="bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-xl py-3 flex items-center justify-center text-xl hover:border-[rgba(99,102,241,0.3)] transition-all">{icons[p] || '🔗'}</a> : null;
          })}
        </div>
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
                <img src={p.url} alt={p.caption || ''} className="w-full h-full object-cover" />
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
          {cfg.title && <div className="font-syne font-bold text-sm mb-1">▶️ {cfg.title as string}</div>}
          {cfg.description && <div className="text-xs text-[var(--text-dim)] mb-3">{cfg.description as string}</div>}
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
            }).catch(() => {});
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
