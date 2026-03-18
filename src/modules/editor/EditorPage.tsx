import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cardsService } from '../../services/cards.service';
import { storageService } from '../../services/storage.service';
import type { Card, CardBlock, CardSettings, CardType } from '../../types';
import { DEFAULT_SETTINGS } from '../../types';
import { getBlocksForCard, groupBlocks, CATEGORY_LABELS } from '../../lib/blocks';
import BlockEditor from './components/BlockEditor';
import toast from 'react-hot-toast';

const GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#06ffa5)',
  'linear-gradient(135deg,#f059da,#6366f1)',
  'linear-gradient(135deg,#ffa502,#ff6348)',
  'linear-gradient(135deg,#00b4d8,#0077b6)',
  'linear-gradient(135deg,#2d6a4f,#06ffa5)',
  'linear-gradient(135deg,#ff4757,#c0392b)',
  'linear-gradient(135deg,#ffd700,#ff8c00)',
];

const CARD_TYPES: { value: CardType; label: string; icon: string; desc: string }[] = [
  { value: 'personal',    icon: '👤', label: 'Personal',    desc: 'Networking y contacto' },
  { value: 'business',    icon: '🏢', label: 'Negocio',     desc: 'Empresa y servicios' },
  { value: 'portfolio',   icon: '🎨', label: 'Portfolio',   desc: 'Proyectos creativos' },
  { value: 'restaurant',  icon: '🍽️', label: 'Restaurante', desc: 'Menú, pedidos y promos' },
  { value: 'medical',     icon: '🏥', label: 'Médico',      desc: 'Emergencia y salud' },
  { value: 'academic',    icon: '🎓', label: 'Académico',   desc: 'Cursos y certificados' },
  { value: 'gamer',       icon: '🎮', label: 'Gaming',      desc: 'Stats, stream y torneos' },
  { value: 'fitness',     icon: '💪', label: 'Fitness',     desc: 'Planes y transformación' },
  { value: 'creator',     icon: '🎭', label: 'Creator',     desc: 'Redes, merch y collabs' },
  { value: 'access',      icon: '🔐', label: 'Acceso',      desc: 'Tickets y check-in' },
  { value: 'event',       icon: '🎟️', label: 'Evento',      desc: 'Countdown y asistentes' },
  { value: 'product',     icon: '🛍️', label: 'Producto',    desc: 'Ficha de producto' },
  { value: 'blank',       icon: '⬡',  label: 'Libre',       desc: 'Totalmente personalizado' },
];

export default function EditorPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const isNew = !cardId;
  const [activeSection, setActiveSection] = useState<'info' | 'blocks' | 'settings'>('info');
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [card, setCard] = useState<Partial<Card>>({
    name: '', type: 'personal', status: 'draft', theme: 'dark-nexus',
    blocks: [], settings: DEFAULT_SETTINGS,
    cover_gradient: GRADIENTS[0],
    full_name: '', role: '', company: '', bio: '',
    avatar_emoji: '🚀', phone: '', email: '', website: '', address: '',
  });

  useEffect(() => {
    if (cardId) cardsService.get(cardId).then(c => setCard(c)).catch(() => toast.error('Error cargando card'));
  }, [cardId]);

  const set = useCallback((k: string, v: unknown) => setCard(p => ({ ...p, [k]: v })), []);
  const setSetting = (k: keyof CardSettings, v: boolean) =>
    setCard(p => ({ ...p, settings: { ...(p.settings || DEFAULT_SETTINGS), [k]: v } }));

  const addBlock = (type: string) => {
    const b: CardBlock = { id: `${type}-${Date.now()}`, type: type as CardBlock['type'], position: card.blocks?.length || 0, config: {}, visible: true };
    set('blocks', [...(card.blocks || []), b]);
    setExpandedBlock(b.id);
    setActiveSection('blocks');
  };

  const updateBlockConfig = (id: string, config: Record<string, unknown>) => {
    set('blocks', (card.blocks || []).map(b => b.id === id ? { ...b, config } : b));
  };

  const removeBlock = (id: string) => set('blocks', (card.blocks || []).filter(b => b.id !== id));
  const toggleBlock = (id: string) => set('blocks', (card.blocks || []).map(b => b.id === id ? { ...b, visible: !b.visible } : b));

  const save = async () => {
    if (!card.name?.trim()) { toast.error('El nombre es requerido'); return; }
    setSaving(true);
    try {
      if (isNew) {
        const c = await cardsService.create(card as Partial<Card>);
        toast.success('¡Card creada!');
        navigate(`/dashboard/editor/${c.id}`, { replace: true });
        setCard(c);
      } else {
        const c = await cardsService.update(cardId!, card as Partial<Card>);
        setCard(c); toast.success('¡Guardado!');
      }
    } catch { toast.error('Error al guardar'); } finally { setSaving(false); }
  };

  const publish = async () => {
    if (isNew) { await save(); return; }
    try {
      const r = await cardsService.publish(cardId!);
      setCard(r.card); toast.success('¡Card publicada!');
    } catch { toast.error('Error al publicar'); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await storageService.uploadImage(file);
      set('avatar_url', url);
      toast.success('Foto de perfil subida');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const cardType = card.type || 'personal';
  const availableBlocks = getBlocksForCard(cardType);
  const groupedBlocks = groupBlocks(availableBlocks);
  const settings = card.settings as CardSettings || DEFAULT_SETTINGS;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="section-title">{isNew ? 'Nueva Card' : 'Editar Card'}</h1>
          {card.public_url && <a href={card.public_url} target="_blank" rel="noreferrer" className="text-xs font-mono text-accent2 hover:underline">{card.public_url}</a>}
        </div>
        <div className="flex gap-2">
          {card.id && card.status !== 'active' && <button className="btn btn-secondary" onClick={publish}>🚀 Publicar</button>}
          {card.id && card.status === 'active' && (
            <button className="btn btn-success" onClick={() => navigate('/dashboard/write', { state: { url: card.public_url, name: card.name } })}>⟁ NFC</button>
          )}
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando...' : '💾 Guardar'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6">
        {/* ── Controls Panel ── */}
        <div>
          {/* Tabs */}
          <div className="flex gap-1 bg-surface border border-[var(--border)] rounded-xl p-1 mb-4">
            {[['info','⬡ Información'],['blocks','🧩 Bloques'],['settings','⚙ Opciones']] .map(([k,l]) => (
              <button key={k} onClick={() => setActiveSection(k as typeof activeSection)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeSection === k ? 'bg-accent text-white' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}>{l}</button>
            ))}
          </div>

          {/* ── INFO TAB ── */}
          {activeSection === 'info' && (
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-sm font-bold mb-4">Tipo de Card</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {CARD_TYPES.map(t => (
                    <button key={t.value} onClick={() => set('type', t.value)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${card.type === t.value ? 'border-accent bg-accent/10' : 'border-[var(--border)] bg-bg hover:border-accent/40'}`}>
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className="text-xs font-semibold">{t.label}</div>
                      <div className="text-[10px] text-[var(--text-dim)] leading-tight">{t.desc}</div>
                    </button>
                  ))}
                </div>
                <div><label className="label">Nombre interno</label>
                  <input className="input" value={card.name || ''} onChange={e => set('name', e.target.value)} placeholder="Mi Card NFC" /></div>
              </div>

              {/* Medical specific fields */}
              {card.type === 'medical' && (
                <div className="card p-5 border-red-500/20 bg-[rgba(255,71,87,0.03)]">
                  <div className="text-xs font-mono text-danger mb-3 flex items-center gap-1">🚨 DATOS DE EMERGENCIA</div>
                  <div className="space-y-3">
                    {[['full_name','Nombre del paciente'],['phone','Teléfono de emergencia'],['address','Hospital de referencia']].map(([k,l]) => (
                      <div key={k}><label className="label">{l}</label>
                        <input className="input" value={(card as Record<string,unknown>)[k] as string || ''} onChange={e => set(k, e.target.value)} /></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Academic specific */}
              {card.type === 'academic' && (
                <div className="card p-5 border-accent/20">
                  <div className="text-xs font-mono text-accent mb-3">🎓 DATOS ACADÉMICOS</div>
                  <div className="space-y-3">
                    {[['full_name','Nombre completo'],['role','Titulación / Especialidad'],['company','Universidad / Institución'],['bio','Resumen profesional']].map(([k,l]) => (
                      <div key={k}><label className="label">{l}</label>
                        {k === 'bio' ? <textarea className="input resize-none h-20" value={(card as Record<string,unknown>)[k] as string || ''} onChange={e => set(k, e.target.value)} />
                          : <input className="input" value={(card as Record<string,unknown>)[k] as string || ''} onChange={e => set(k, e.target.value)} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurant specific */}
              {card.type === 'restaurant' && (
                <div className="card p-5 border-orange-500/20">
                  <div className="text-xs font-mono text-warn mb-3">🍽️ DATOS DEL RESTAURANTE</div>
                  <div className="space-y-3">
                    {[['full_name','Nombre del restaurante'],['role','Tipo de cocina'],['address','Dirección'],['phone','Teléfono de reservas'],['website','Plataforma de pedidos (URL)']].map(([k,l]) => (
                      <div key={k}><label className="label">{l}</label>
                        <input className="input" value={(card as Record<string,unknown>)[k] as string || ''} onChange={e => set(k, e.target.value)} /></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generic contact info */}
              {!['medical','restaurant','academic'].includes(card.type || '') && (
                <div className="card p-5">
                  <h3 className="text-sm font-bold mb-4">Información de contacto</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Foto de perfil (URL externa o Subir)</label>
                      <div className="flex gap-2">
                        <input className="input flex-1" placeholder="https://..." value={card.avatar_url || ''} onChange={e => set('avatar_url', e.target.value)} />
                        <label className="btn btn-secondary cursor-pointer whitespace-nowrap min-w-[90px] justify-center">
                          {uploadingAvatar ? '⏳' : '📂 Subir'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                        </label>
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] mt-1">Sube la foto directo a la Card o pega un enlace web.</p>
                    </div>
                    {[['full_name','Nombre'],['role','Cargo'],['company','Empresa'],['bio','Bio'],['avatar_emoji','Emoji'],['phone','Teléfono'],['email','Email'],['website','Web'],['address','Dirección']].map(([k,l]) => (
                      <div key={k}><label className="label">{l}</label>
                        {k === 'bio' ? <textarea className="input resize-none h-16" value={(card as Record<string,unknown>)[k] as string || ''} onChange={e => set(k, e.target.value)} />
                          : <input className="input" value={(card as Record<string,unknown>)[k] as string || ''} onChange={e => set(k, e.target.value)} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card p-5">
                <h3 className="text-sm font-bold mb-3">🎨 Portada</h3>
                <div className="flex gap-2 flex-wrap">
                  {GRADIENTS.map(g => (
                    <button key={g} onClick={() => set('cover_gradient', g)}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${card.cover_gradient === g ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ background: g }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BLOCKS TAB ── */}
          {activeSection === 'blocks' && (
            <div className="space-y-4">
              {/* Active blocks */}
              {(card.blocks || []).length > 0 && (
                <div className="card p-4">
                  <h3 className="text-sm font-bold mb-3">Bloques activos</h3>
                  <div className="space-y-2">
                    {(card.blocks || []).map(b => (
                      <div key={b.id} className="bg-bg border border-[var(--border)] rounded-xl overflow-hidden">
                        <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer" onClick={() => setExpandedBlock(expandedBlock === b.id ? null : b.id)}>
                          <span className="text-[var(--text-dim)] text-xs">⠿</span>
                          <span className="flex-1 text-sm font-medium capitalize">{b.type.replace(/_/g, ' ')}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.visible ? 'bg-accent2' : 'bg-[var(--text-dim)]'}`} />
                          <button onClick={e => { e.stopPropagation(); toggleBlock(b.id); }} className="text-[var(--text-dim)] hover:text-accent text-xs px-1">👁</button>
                          <button onClick={e => { e.stopPropagation(); removeBlock(b.id); }} className="text-[var(--text-dim)] hover:text-danger text-xs px-1">✕</button>
                          <span className="text-[var(--text-dim)] text-xs">{expandedBlock === b.id ? '▲' : '▼'}</span>
                        </div>
                        {expandedBlock === b.id && (
                          <div className="px-3 pb-3 border-t border-[var(--border)]">
                            <div className="pt-3"><BlockEditor block={b} onChange={updateBlockConfig} /></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add blocks */}
              {Object.entries(groupedBlocks).map(([cat, defs]) => (
                <div key={cat} className="card p-4">
                  <h3 className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest mb-3">{CATEGORY_LABELS[cat] || cat}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {defs.map(b => (
                      <button key={b.type} onClick={() => addBlock(b.type)}
                        className="bg-bg border border-[var(--border)] rounded-xl p-2.5 text-center text-xs text-[var(--text-dim)] hover:border-accent hover:text-accent transition-all">
                        <span className="block text-xl mb-1">{b.icon}</span>{b.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeSection === 'settings' && (
            <div className="card p-5">
              <h3 className="text-sm font-bold mb-4">Opciones avanzadas</h3>

              <div className="mb-6">
                <label className="label">Color de la Card (Tema)</label>
                <div className="flex gap-3 items-center">
                  <input type="color" className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" 
                    value={settings.theme_color || '#6366f1'} 
                    onChange={e => setSetting('theme_color' as any, e.target.value as any)} 
                  />
                  <div className="flex-1">
                    <input className="input w-full font-mono text-xs uppercase" 
                      value={settings.theme_color || '#6366f1'} 
                      onChange={e => setSetting('theme_color' as any, e.target.value as any)} 
                      placeholder="#6366F1"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {([
                  ['save_contact_btn',    'Botón Guardar Contacto',    'Descarga .vcf en iOS y Android'],
                  ['analytics_enabled',   'Analíticas',                'Registra escaneos por dispositivo'],
                  ['whatsapp_button',     'Botón WhatsApp',            'FAB flotante con número de teléfono'],
                  ['auto_dark_mode',      'Dark mode automático',      'Detecta preferencia del visitante'],
                  ['animations',          'Animaciones',               'Efectos al cargar la página'],
                  ['seo_enabled',         'SEO optimizado',            'Meta tags automáticos'],
                  ['password_protected',  'Proteger con contraseña',   'Solo acceso con PIN'],
                  ['show_emergency_banner','Banner de emergencia',      'Muestra alerta roja en perfil médico'],
                  ['realtime_enabled',    'Perfil en tiempo real',     'Cambios se reflejan inmediatamente'],
                ] as [keyof CardSettings, string, string][]).map(([k, label, sub]) => (
                  <div key={k} className="flex items-center justify-between py-3">
                    <div><div className="text-sm font-medium">{label}</div><div className="text-xs text-[var(--text-dim)]">{sub}</div></div>
                    <div className={`toggle-track ${settings[k] ? 'on' : ''}`} onClick={() => setSetting(k, !settings[k])}>
                      <div className="toggle-thumb" /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Preview ── */}
        <div>
          <div className="sticky top-20">
            <p className="text-center text-[10px] font-mono text-[var(--text-dim)] tracking-widest uppercase mb-4">Preview en vivo</p>
            <PhonePreview card={card} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PhonePreview({ card }: { card: Partial<Card> }) {
  const type = card.type || 'personal';
  const isMedical = type === 'medical';

  return (
    <div className="flex justify-center">
      <div className="w-[300px] bg-black rounded-[36px] border-[7px] border-[#1a1a2e] shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="h-6 bg-black flex items-center justify-center"><div className="w-16 h-3 bg-[#111] rounded-full" /></div>
        <div className="bg-[#050508] min-h-[560px]" style={{ '--accent': (card.settings as CardSettings)?.theme_color || '#6366f1' } as React.CSSProperties}>
          {isMedical && <div className="bg-danger text-white text-[10px] font-mono text-center py-1.5 font-bold tracking-widest">🚨 PERFIL DE EMERGENCIA MÉDICA</div>}
          <div className="h-28 relative" style={{ background: isMedical ? 'linear-gradient(135deg,#ff4757,#c0392b)' : card.cover_gradient || GRADIENTS[0] }}>
            <div className="absolute bottom-0 left-4 translate-y-1/2 w-16 h-16 rounded-full border-[3px] border-[#050508] flex items-center justify-center text-2xl overflow-hidden bg-surface"
              style={{ background: isMedical ? '#fff' : 'linear-gradient(135deg,#f059da,#6366f1)' }}>
              {card.avatar_url ? (
                <img src={card.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                isMedical ? '🏥' : card.avatar_emoji || '🚀'
              )}
            </div>
          </div>
          <div className="px-4 pt-9 pb-4">
            <div className="font-syne text-base font-extrabold text-white">{card.full_name || 'Tu Nombre'}</div>
            <div className="text-[11px] text-[var(--text-dim)]">{[card.role, card.company].filter(Boolean).join(' · ') || ''}</div>
            {card.bio && <div className="text-[10px] text-[var(--text-mid)] mt-2 line-clamp-2">{card.bio}</div>}

            {!isMedical && (
              <div className="mt-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] rounded-xl p-2 text-center text-[10px] font-semibold">💾 Guardar Contacto</div>
            )}

            <div className="mt-2 space-y-1" style={{ color: 'var(--accent)' }}>
              {card.phone && <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl px-2.5 py-1.5 text-[10px]">📞 {card.phone}</div>}
              {card.email && <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl px-2.5 py-1.5 text-[10px]">📧 {card.email}</div>}
            </div>

            {(card.blocks || []).filter(b => b.visible).slice(0, 4).map(b => (
              <div key={b.id} className="mt-1.5 bg-[#13131e] border border-[rgba(255,255,255,0.07)] rounded-xl px-2.5 py-1.5 text-[10px] text-[var(--text-dim)] capitalize flex items-center gap-1">
                {b.type === 'spotify_track' || b.type === 'spotify_playlist' ? '🎵' : b.type === 'menu' ? '🍽️' : b.type === 'blood_type' ? '🩸' : b.type === 'certificate' ? '🏆' : '📦'}
                {' '}{b.type.replace(/_/g, ' ')}
              </div>
            ))}
            {(card.blocks || []).length > 4 && (
              <div className="text-[8px] text-center text-[var(--text-dim)] font-mono mt-1">+{card.blocks!.length - 4} más</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
