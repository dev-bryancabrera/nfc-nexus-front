// ── CardsPage ─────────────────────────────────────────────
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardsStore } from '../../store/cards.store';
import { cardsService } from '../../services/cards.service';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, string> = { personal:'👤', business:'🏢', portfolio:'🎨', restaurant:'🍽️', medical:'🏥', academic:'🎓', event:'🎟️', product:'🛍️', blank:'⬡' };

export function CardsPage() {
  const navigate = useNavigate();
  const { cards, fetchCards, loading, removeCard, addCard } = useCardsStore();
  useEffect(() => { fetchCards(); }, []);

  const del = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await cardsService.delete(id).then(() => { removeCard(id); toast.success('Eliminada'); }).catch(() => toast.error('Error'));
  };
  const dup = async (id: string) => {
    await cardsService.duplicate(id).then(c => { addCard(c); toast.success('Duplicada'); }).catch(() => toast.error('Error'));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Todas mis Cards</h1>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/editor')}>+ Nueva Card</button>
      </div>
      {loading ? <div className="text-center py-20 text-[var(--text-dim)]">Cargando...</div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {cards.map(c => (
              <div key={c.id} className="card card-hover p-6 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: c.cover_gradient }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{TYPE_ICONS[c.type] || '◈'}</span>
                    <span className="text-[10px] font-mono text-[var(--text-dim)] capitalize">{c.type}</span>
                  </div>
                  <span className={c.status === 'active' ? 'badge-active' : 'badge-draft'}>{c.status === 'active' ? '● Activa' : '◌ Borrador'}</span>
                </div>
                <div className="font-syne text-lg font-bold mb-1">{c.name}</div>
                <div className="text-xs text-[var(--text-dim)] mb-3 line-clamp-2">{c.bio || c.role || '—'}</div>
                <div className="text-xs font-mono text-[var(--text-dim)] border-t border-[var(--border)] pt-3 mb-3">⚡ {c.scan_count} scans · {new Date(c.updated_at).toLocaleDateString('es')}</div>
                {c.public_url && <div className="text-[10px] font-mono text-accent2 mb-3 truncate">{c.public_url}</div>}
                <div className="flex gap-2">
                  <button className="btn btn-secondary text-xs flex-1" onClick={() => navigate(`/dashboard/editor/${c.id}`)}>✦ Editar</button>
                  <button className="btn btn-ghost text-xs" onClick={() => dup(c.id)} title="Duplicar">⊕</button>
                  <button className="btn btn-danger text-xs" onClick={() => del(c.id, c.name)}>✕</button>
                </div>
              </div>
            ))}
            <button onClick={() => navigate('/dashboard/editor')} className="card border-dashed border-2 min-h-[180px] flex flex-col items-center justify-center gap-2 text-[var(--text-dim)] hover:border-accent hover:text-accent hover:bg-accent/5 transition-all">
              <span className="text-3xl">+</span><span className="text-sm font-medium">Nueva Card</span>
            </button>
          </div>
        )}
    </div>
  );
}
