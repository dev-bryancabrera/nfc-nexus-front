import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { publicService } from '../../services/public.service';
import { domainLib } from '../../lib/domain';
import { useRealtimeBlocks } from '../../services/realtime.service';
import type { Card, CardSettings, CardBlock } from '../../types';
import { getCardTheme } from '../../lib/cardTheme';
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
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

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
    setCard(prev => {
      if (!prev) return prev;
      const updated = prev.blocks.map(b => {
        const rt = realtimeBlocks.find(rb => rb.id === b.id);
        return rt ? { ...b, config: { ...b.config, ...rt.config } } : b;
      });
      return { ...prev, blocks: updated };
    });
  }, []);

  useRealtimeBlocks(card?.id, isRealtimeEnabled, handleRealtimeUpdate, 15000);

  // Load Google Font dynamically — must be called unconditionally (Rules of Hooks)
  const cardThemeForFont = card
    ? getCardTheme((card.settings as CardSettings)?.card_style, (card.settings as CardSettings)?.font_style)
    : null;
  useEffect(() => {
    if (!cardThemeForFont?.googleFontsUrl) return;
    const linkId = 'card-custom-font';
    if (document.getElementById(linkId)) return;
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = cardThemeForFont.googleFontsUrl;
    document.head.appendChild(link);
  }, [cardThemeForFont?.googleFontsUrl]);

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

  // ── Password gate ──────────────────────────────────────
  if (cardSettings.password_protected && cardSettings.access_password && !unlocked) {
    const checkPin = () => {
      if (pinInput === cardSettings.access_password) { setUnlocked(true); setPinError(false); }
      else { setPinError(true); }
    };
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6">
        <div className="w-full max-w-xs">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="font-syne text-xl font-bold text-white">Acceso protegido</h1>
            <p className="text-sm text-[#6b6b8a] mt-2">Ingresa la contraseña para ver este perfil</p>
          </div>
          <input
            type="password"
            className="w-full bg-[#0d0d14] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 text-white text-center text-base tracking-widest focus:outline-none focus:border-[#6366f1] transition-colors mb-3"
            placeholder="Contraseña"
            value={pinInput}
            autoFocus
            onChange={e => { setPinInput(e.target.value); setPinError(false); }}
            onKeyDown={e => e.key === 'Enter' && checkPin()}
          />
          {pinError && <p className="text-[#ff4757] text-xs text-center mb-3">Contraseña incorrecta, intenta de nuevo.</p>}
          <button
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#6366f1' }}
            onClick={checkPin}
          >
            Acceder →
          </button>
          <div className="text-center mt-10 text-[9px] font-mono text-[#6b6b8a] tracking-widest">Powered by BRTECH NFC ⟁</div>
        </div>
      </div>
    );
  }

  const baseTheme = TYPE_THEMES[card.type] || TYPE_THEMES.academic;
  const accent = cardSettings.theme_color || baseTheme.accent;
  const isMedical = card.type === 'medical';
  const isGamer = card.type === 'gamer';
  const isRestaurant = card.type === 'restaurant';
  const coverGradient = isMedical ? baseTheme.cover : card.cover_gradient;

  const cardTheme = getCardTheme(cardSettings.card_style, cardSettings.font_style);
  const profileLayout = cardSettings.profile_layout || 'standard';
  const pageBg = cardTheme.pageBackground(accent);
  // Gamer keeps special layout only on 'standard'
  const useGamerLayout = isGamer && profileLayout === 'standard';

  const avatarContent = card.avatar_url ? (
    <img src={card.avatar_url} alt={card.full_name || 'Perfil'} className="w-full h-full object-cover" />
  ) : (
    isGamer ? '🎮' : isMedical ? '🏥' : card.avatar_emoji || '🚀'
  );

  const contactLinkStyle = {
    background: cardTheme.blockBg !== 'transparent' ? cardTheme.blockBg : `${accent}08`,
    border: cardTheme.blockBorder(accent),
    boxShadow: cardTheme.hasNeonGlow ? `0 0 12px ${accent}35` : undefined,
  };

  return (
    <div className="min-h-screen relative" style={{ background: pageBg, fontFamily: cardTheme.fontFamily, color: cardTheme.textColor }}>

      {/* Aurora overlay */}
      {cardTheme.hasAurora && (
        <>
          <style>{`
            @keyframes nfc-aurora {
              0%,100% { transform:translate(-30%,-30%) scale(1.2) rotate(0deg); opacity:.18; }
              33%      { transform:translate(10%,-20%)  scale(1.4) rotate(120deg); opacity:.24; }
              66%      { transform:translate(-10%,20%)  scale(1.1) rotate(240deg); opacity:.14; }
            }
          `}</style>
          <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
            <div style={{
              position:'absolute', width:'150%', height:'150%', top:'-25%', left:'-25%',
              background:`radial-gradient(ellipse 60% 40% at 50% 50%, ${accent}30 0%, transparent 70%)`,
              animation:'nfc-aurora 9s ease-in-out infinite',
            }} />
          </div>
        </>
      )}

      {/* Emergency banner */}
      {cardSettings.show_emergency_banner && (
        <div className="bg-[#ff4757] text-white text-xs font-mono text-center py-2.5 font-bold tracking-widest sticky top-0 z-50">
          🚨 {isMedical ? 'PERFIL MÉDICO DE EMERGENCIA — MOSTRAR ESTA PANTALLA AL PERSONAL' : 'BANNER DE EMERGENCIA ACTIVO'}
        </div>
      )}

      {/* ── Cover section — layout-aware ── */}

      {/* Gamer standard: special dark banner */}
      {useGamerLayout && (
        <div className="h-44 relative overflow-hidden z-10" style={{ background: baseTheme.cover }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#05040a]" />
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="text-[120px]">🎮</div>
          </div>
          <div className="absolute bottom-0 left-5 translate-y-1/2 w-20 h-20 rounded-2xl border-[4px] border-[#05040a] bg-[rgba(240,89,218,0.2)] overflow-hidden flex items-center justify-center text-3xl"
            style={{ boxShadow: `0 0 30px ${accent}40` }}>
            {avatarContent}
          </div>
        </div>
      )}

      {/* Standard / Banner cover */}
      {!useGamerLayout && (profileLayout === 'standard' || profileLayout === 'banner') && (
        <div className={`${profileLayout === 'banner' ? 'h-60' : 'h-44'} relative z-10`} style={{ background: coverGradient }}>
          {isMedical && <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />}
          <div className={`absolute bottom-0 translate-y-1/2 ${profileLayout === 'banner' ? 'left-1/2 -translate-x-1/2' : 'left-5'} ${profileLayout === 'banner' ? 'w-24 h-24 rounded-2xl' : 'w-20 h-20 rounded-full'} border-[4px] overflow-hidden flex items-center justify-center text-3xl`}
            style={{ borderColor: cardTheme.avatarBorderColor, background: isMedical ? '#fff' : cardTheme.avatarBg(accent) }}>
            {avatarContent}
          </div>
        </div>
      )}

      {/* Centered layout: large centered avatar, no cover */}
      {profileLayout === 'centered' && !useGamerLayout && (
        <div className="pt-12 flex flex-col items-center relative z-10">
          <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center text-4xl border-4"
            style={{ background: isMedical ? '#fff' : cardTheme.avatarBg(accent), borderColor: accent + '45' }}>
            {avatarContent}
          </div>
        </div>
      )}

      {/* Body */}
      <div className={`max-w-sm mx-auto px-5 pb-16 relative z-10 ${
        useGamerLayout || profileLayout === 'standard' ? 'pt-14' :
        profileLayout === 'banner'  ? 'pt-16' :
        profileLayout === 'centered' ? 'pt-5 text-center' :
        'pt-6'
      }`}>

        {/* Minimal layout: small avatar inline with name */}
        {profileLayout === 'minimal' && !useGamerLayout && (
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl"
              style={{ background: isMedical ? '#fff' : cardTheme.avatarBg(accent) }}>
              {avatarContent}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: cardTheme.textColor }}>{card.full_name || 'Sin nombre'}</h1>
              {(card.role || card.company) && (
                <p className="text-sm mt-0.5" style={{ color: cardTheme.textDimColor }}>{[card.role, card.company].filter(Boolean).join(' · ')}</p>
              )}
            </div>
          </div>
        )}

        {profileLayout !== 'minimal' && (
          <>
            <h1 className="text-2xl font-extrabold" style={{ color: cardTheme.textColor }}>{card.full_name || 'Sin nombre'}</h1>
            {(card.role || card.company) && (
              <p className="text-sm mt-0.5" style={{ color: cardTheme.textDimColor }}>{[card.role, card.company].filter(Boolean).join(' · ')}</p>
            )}
          </>
        )}

        {card.bio && <p className="text-sm mt-3 leading-relaxed" style={{ color: cardTheme.bioColor }}>{card.bio}</p>}

        {/* Realtime indicator */}
        {isRealtimeEnabled && (
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${profileLayout === 'centered' ? 'mx-auto' : ''}`}
            style={{ background: 'rgba(6,255,165,0.08)', border: '1px solid rgba(6,255,165,0.25)' }}>
            <div className="w-2 h-2 rounded-full bg-[#06ffa5] animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-mono text-[#06ffa5] tracking-wider font-semibold">EN VIVO</span>
          </div>
        )}

        {/* Save contact */}
        {!isMedical && cardSettings.save_contact_btn !== false && (
          <button onClick={saveContact}
            className="w-full mt-4 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-95"
            style={{ background: `${accent}18`, border: `1px solid ${accent}33`, color: accent,
              boxShadow: cardTheme.hasNeonGlow ? `0 0 14px ${accent}40` : undefined }}>
            💾 Guardar Contacto
          </button>
        )}

        {/* Contact links */}
        {!isRestaurant && (card.phone || card.email || card.website) && (
          <div className="mt-3 space-y-2.5">
            {card.phone && (
              <a href={`tel:${card.phone}`} onClick={() => publicService.recordScan(slug, 'called')}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm hover:opacity-80 transition-all active:scale-95"
                style={{ ...contactLinkStyle, color: cardTheme.isLight ? cardTheme.textColor : undefined }}>
                📞 <span className="font-medium">{card.phone}</span>
              </a>
            )}
            {card.email && (
              <a href={`mailto:${card.email}`} onClick={() => publicService.recordScan(slug, 'emailed')}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm hover:opacity-80 transition-all active:scale-95"
                style={{ ...contactLinkStyle, color: cardTheme.isLight ? cardTheme.textColor : undefined }}>
                📧 <span className="font-medium">{card.email}</span>
              </a>
            )}
            {card.website && (
              <a href={card.website} target="_blank" rel="noreferrer" onClick={() => publicService.recordScan(slug, 'clicked_link')}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm hover:opacity-80 transition-all active:scale-95"
                style={{ ...contactLinkStyle, color: cardTheme.isLight ? cardTheme.textColor : undefined }}>
                🌐 <span className="font-medium">{card.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        )}

        {/* All blocks */}
        <div className="mt-4 space-y-3">
          {card.blocks?.filter(b => b.visible).map((block, i) => (
            <div key={block.id}
              className={cardSettings.animations !== false ? 'animate-fade-in-up' : ''}
              style={cardSettings.animations !== false ? { animationDelay: `${i * 80}ms` } : undefined}>
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
        <button
          onClick={() => {
            const cleanPhone = card.phone!.replace(/\D/g, '');
            const message = cardSettings.whatsapp_message
              ? encodeURIComponent(cardSettings.whatsapp_message)
              : '';
            // Try deep link first (opens native app on mobile)
            const deepLink = `whatsapp://send?phone=${cleanPhone}${message ? `&text=${message}` : ''}`;
            const webLink = `https://wa.me/${cleanPhone}${message ? `?text=${message}` : ''}`;
            // On mobile: deep link opens the app directly
            // On desktop or if app not installed: fallback to web
            const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
            if (isMobile) {
              let appOpened = false;
              const iframe = document.createElement('iframe');
              iframe.style.display = 'none';
              iframe.src = deepLink;
              document.body.appendChild(iframe);
              const timeout = setTimeout(() => {
                if (!appOpened) window.open(webLink, '_blank');
                document.body.removeChild(iframe);
              }, 1500);
              window.addEventListener('blur', () => {
                appOpened = true;
                clearTimeout(timeout);
              }, { once: true });
            } else {
              window.open(webLink, '_blank');
            }
            publicService.recordScan(slug, 'clicked_link');
          }}
          className="fixed bottom-6 right-5 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform z-50 cursor-pointer border-0"
          title="Contactar por WhatsApp"
          aria-label="Abrir WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="white" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      )}

      <div className="text-center pb-8 text-[9px] font-mono text-[#6b6b8a] tracking-widest">Powered by BRTECH NFC ⟁</div>
    </div>
  );
}
