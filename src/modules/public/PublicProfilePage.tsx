import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { publicService } from '../../services/public.service';
import { domainLib } from '../../lib/domain';
import { useRealtimeBlocks } from '../../services/realtime.service';
import type { Card, CardSettings, CardBlock } from '../../types';
import BlockRenderer from './renderers/BlockRenderer';

interface Props { slugOverride?: string }

const TYPE_THEMES: Record<string, { accent: string; bg: string; cover: string }> = {
  medical: { accent: '#ff4757', bg: '#050508', cover: 'linear-gradient(135deg,#ff4757,#c0392b)' },
  restaurant: { accent: '#ffa502', bg: '#050508', cover: 'linear-gradient(135deg,#ffa502,#e67e22)' },
  academic: { accent: '#6366f1', bg: '#050508', cover: 'linear-gradient(135deg,#6366f1,#4f52d9)' },
  gamer: { accent: '#f059da', bg: '#05040a', cover: 'linear-gradient(135deg,#1a0533,#0a0518)' },
  fitness: { accent: '#06ffa5', bg: '#020a06', cover: 'linear-gradient(135deg,#06ffa5,#00cc88)' },
  creator: { accent: '#f059da', bg: '#050508', cover: 'linear-gradient(135deg,#f059da,#6366f1)' },
  access: { accent: '#6366f1', bg: '#050508', cover: 'linear-gradient(135deg,#0d0d14,#1a1a2e)' },
};

export default function PublicProfilePage({ slugOverride }: Props) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = slugOverride || paramSlug || '';
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    const fetch = domainLib.mode === 'subdomain' && slugOverride
      ? publicService.getCardBySubdomain()
      : publicService.getCard(slug);

    fetch.then(res => {
      setCard(res.card as unknown as Card);
      if (res.card.full_name) document.title = `${res.card.full_name} — BRTECH NFC`;
    }).catch(() => setNotFound(true)).finally(() => setLoading(false));
  }, [slug]);

  // Realtime polling: merge updated realtime blocks into card
  const settings = card?.settings as CardSettings | undefined;
  const isRealtimeEnabled = settings?.realtime_enabled ?? false;

  const handleRealtimeUpdate = useCallback((realtimeBlocks: CardBlock[]) => {
    if (!card) return;
    setCard(prev => {
      if (!prev) return prev;
      const updated = prev.blocks.map(b => {
        const rt = realtimeBlocks.find(rb => rb.id === b.id);
        return rt ? { ...b, config: { ...b.config, ...rt.config } } : b;
      });
      return { ...prev, blocks: updated };
    });
  }, [card?.id]);

  useRealtimeBlocks(card?.id, isRealtimeEnabled, handleRealtimeUpdate, 15000);

  const saveContact = () => {
    if (!card) return;
    const vcf = ['BEGIN:VCARD', 'VERSION:3.0',
      `FN:${card.full_name || ''}`,
      card.role ? `TITLE:${card.role}` : '',
      card.company ? `ORG:${card.company}` : '',
      card.phone ? `TEL:${card.phone}` : '',
      card.email ? `EMAIL:${card.email}` : '',
      card.website ? `URL:${card.website}` : '',
      card.address ? `ADR:;;${card.address};;;;` : '',
      `NOTE:${card.public_url}`,
      'END:VCARD',
    ].filter(Boolean).join('\r\n');
    Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' })),
      download: `${card.full_name || 'contacto'}.vcf`,
    }).click();
    publicService.recordScan(slug, 'saved_contact');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center">
      <div className="text-center"><div className="text-5xl mb-3 animate-pulse">⟁</div>
        <div className="text-xs font-mono text-[#6b6b8a] tracking-widest">CARGANDO...</div></div>
    </div>
  );
  if (notFound || !card) return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4 text-center">
      <div><div className="text-5xl mb-4">◈</div>
        <h1 className="font-syne text-2xl font-bold text-white mb-2">Card no encontrada</h1>
        <p className="text-sm text-[#6b6b8a]">Esta card no existe o fue desactivada.</p></div>
    </div>
  );

  const cardSettings = card.settings as CardSettings;
  const baseTheme = TYPE_THEMES[card.type] || TYPE_THEMES.academic;
  const theme = { ...baseTheme, accent: cardSettings.theme_color || baseTheme.accent };
  const isMedical = card.type === 'medical';
  const isGamer = card.type === 'gamer';
  const isRestaurant = card.type === 'restaurant';
  const coverGradient = isMedical ? theme.cover : card.cover_gradient;

  const avatarContent = card.avatar_url ? (
    <img src={card.avatar_url} alt={card.full_name || 'Perfil'} className="w-full h-full object-cover" />
  ) : (
    isGamer ? '🎮' : isMedical ? '🏥' : card.avatar_emoji || '🚀'
  );

  return (
    <div className="min-h-screen text-[#e8e8f0]" style={{ background: theme.bg, fontFamily: 'Outfit, sans-serif' }}>
      {/* Emergency banner */}
      {isMedical && cardSettings.show_emergency_banner && (
        <div className="bg-[#ff4757] text-white text-xs font-mono text-center py-2.5 font-bold tracking-widest sticky top-0 z-50">
          🚨 PERFIL MÉDICO DE EMERGENCIA — MOSTRAR ESTA PANTALLA AL PERSONAL
        </div>
      )}

      {/* Gamer: special dark banner */}
      {isGamer && (
        <div className="h-44 relative overflow-hidden" style={{ background: theme.cover }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#05040a]" />
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-[120px]">🎮</div>
          </div>
          <div className="absolute bottom-0 left-5 translate-y-1/2 w-20 h-20 rounded-2xl border-[4px] border-[#05040a] bg-[rgba(240,89,218,0.2)] overflow-hidden flex items-center justify-center text-3xl"
            style={{ boxShadow: `0 0 30px ${theme.accent}40` }}>
            {avatarContent}
          </div>
        </div>
      )}

      {/* Default cover */}
      {!isGamer && (
        <div className="h-44 relative" style={{ background: coverGradient }}>
          {isMedical && <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />}
          <div className="absolute bottom-0 left-5 translate-y-1/2 w-20 h-20 rounded-full border-[4px] border-[#050508] bg-surface overflow-hidden flex items-center justify-center text-3xl"
            style={{ background: isMedical ? '#fff' : `linear-gradient(135deg,#f059da,#6366f1)` }}>
            {avatarContent}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-sm mx-auto px-5 pt-14 pb-16">
        <h1 className="font-syne text-2xl font-extrabold">{card.full_name || 'Sin nombre'}</h1>
        {(card.role || card.company) && (
          <p className="text-sm text-[#6b6b8a] mt-0.5">{[card.role, card.company].filter(Boolean).join(' · ')}</p>
        )}
        {card.bio && <p className="text-sm text-[#a0a0c0] mt-3 leading-relaxed">{card.bio}</p>}

        {/* Realtime indicator */}
        {isRealtimeEnabled && (
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#06ffa5] animate-pulse" />
            <span className="text-[9px] font-mono text-[#06ffa5] tracking-wider">PERFIL DINÁMICO</span>
          </div>
        )}

        {/* Save contact */}
        {!isMedical && cardSettings.save_contact_btn !== false && (
          <button onClick={saveContact}
            className="w-full mt-4 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-95"
            style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}33`, color: theme.accent }}>
            💾 Guardar Contacto
          </button>
        )}

        {/* Contact links */}
        {!isRestaurant && (card.phone || card.email || card.website) && (
          <div className="mt-3 space-y-2.5">
            {card.phone && (
              <a href={`tel:${card.phone}`} onClick={() => publicService.recordScan(slug, 'called')}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm hover:opacity-80 transition-all active:scale-95"
                style={{ background: `${theme.accent}08`, border: `1px solid ${theme.accent}20` }}>
                📞 <span className="font-medium">{card.phone}</span>
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} onClick={() => publicService.recordScan(slug, 'emailed')}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm hover:opacity-80 transition-all active:scale-95"
                style={{ background: `${theme.accent}08`, border: `1px solid ${theme.accent}20` }}>
                📧 <span className="font-medium">{card.email}</span>
              </a>
            )}
            {card.website && (
              <a href={card.website} target="_blank" rel="noreferrer" onClick={() => publicService.recordScan(slug, 'clicked_link')}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm hover:opacity-80 transition-all active:scale-95"
                style={{ background: `${theme.accent}08`, border: `1px solid ${theme.accent}20` }}>
                🌐 <span className="font-medium">{card.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        )}

        {/* All blocks */}
        <div className="mt-4 space-y-3">
          {card.blocks?.filter(b => b.visible).map((block, i) => (
            <div key={block.id} className={cardSettings.animations ? "animate-fade-in-up" : ""} style={{ animationDelay: `${(i + 1) * 75}ms`, animationFillMode: 'both' }}>
              <BlockRenderer block={block} slug={slug} />
            </div>
          ))}
        </div>

        {/* Restaurant contact at bottom */}
        {isRestaurant && (card.phone || card.address) && (
          <div className="mt-4 space-y-2">
            {card.phone && <a href={`tel:${card.phone}`} onClick={() => publicService.recordScan(slug, 'called')} className="flex items-center gap-3 bg-[rgba(255,165,2,0.08)] border border-[rgba(255,165,2,0.2)] rounded-2xl px-4 py-3 text-sm hover:border-[rgba(255,165,2,0.4)] transition-all">📞 <span>{card.phone}</span></a>}
            {card.address && <a href={`https://maps.google.com/?q=${encodeURIComponent(card.address)}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-[rgba(255,165,2,0.08)] border border-[rgba(255,165,2,0.2)] rounded-2xl px-4 py-3 text-sm hover:border-[rgba(255,165,2,0.4)] transition-all">📍 <span>{card.address}</span></a>}
          </div>
        )}
      </div>

      {/* WhatsApp FAB */}
      {cardSettings.whatsapp_button && card.phone && (
        <a href={`https://wa.me/${card.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
          className="fixed bottom-6 right-5 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform z-50">
          💬
        </a>
      )}

      <div className="text-center pb-8 text-[9px] font-mono text-[#6b6b8a] tracking-widest">Powered by BRTECH NFC ⟁</div>
    </div>
  );
}
