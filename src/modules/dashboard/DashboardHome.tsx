import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analytics.service';
import { cardsService } from '../../services/cards.service';
import { useAuthStore } from '../../store/auth.store';
import type { Card, AnalyticsOverview } from '../../types';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, string> = {
  personal:'👤', business:'🏢', portfolio:'🎨', restaurant:'🍽️',
  medical:'🏥', academic:'🎓', event:'🎟️', product:'🛍️', blank:'⬡'
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [cards, setCards] = useState<Card[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([cardsService.list(), analyticsService.overview()])
      .then(([c, a]) => { setCards(c); setOverview(a); })
      .catch(() => toast.error('Error cargando datos'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-syne text-2xl font-extrabold">Hola, {user?.full_name?.split(' ')[0] || 'Usuario'} 👋</h1>
        <p className="text-sm text-[var(--text-dim)] mt-1">Gestiona tus NFC cards y visualiza tus métricas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l:'Total Escaneos',     v: overview?.total_scans ?? '—',         c:'text-accent',  i:'⚡' },
          { l:'Cards Activas',      v: overview?.active_cards ?? '—',        c:'',             i:'◈' },
          { l:'Contactos Guardados',v: overview?.saved_contacts ?? '—',      c:'text-accent2', i:'💾' },
          { l:'Conversión',         v: overview ? `${overview.conversion_rate}%` : '—', c:'text-accent3', i:'📈' },
        ].map(s => (
          <div key={s.l} className="card p-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            <div className="absolute top-4 right-4 text-2xl opacity-15">{s.i}</div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-dim)] mb-2">{s.l}</div>
            <div className={`font-syne text-3xl font-extrabold ${s.c}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">Mis NFC Cards</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/editor')}>+ Crear Card</button>
      </div>

      {loading ? <div className="text-center py-16 text-[var(--text-dim)]">Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map(card => (
            <div key={card.id} className="card card-hover p-6 relative overflow-hidden cursor-pointer" onClick={() => navigate(`/dashboard/editor/${card.id}`)}>
              <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: card.cover_gradient }} />
              <div className="flex items-start justify-between mb-3">
                <span className="text-xl">{TYPE_ICONS[card.type] || '◈'}</span>
                <span className={card.status === 'active' ? 'badge-active' : 'badge-draft'}>{card.status === 'active' ? '● Activa' : '◌ Borrador'}</span>
              </div>
              <div className="font-syne text-lg font-bold mb-1">{card.name}</div>
              <div className="text-xs text-[var(--text-dim)] mb-4 line-clamp-2">{card.bio || card.role || '—'}</div>
              <div className="flex gap-4 text-xs font-mono text-[var(--text-dim)] border-t border-[var(--border)] pt-3 mb-3">
                <span>⚡ {card.scan_count} scans</span>
                <span>{card.type}</span>
              </div>
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <button className="btn btn-secondary flex-1 text-xs py-1.5" onClick={() => navigate(`/dashboard/editor/${card.id}`)}>✦ Editar</button>
                <button className="btn btn-success text-xs py-1.5" onClick={() => navigate('/dashboard/write', { state: { url: card.public_url, name: card.name } })}>⟁ NFC</button>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/dashboard/editor')}
            className="card border-dashed border-2 min-h-[180px] flex flex-col items-center justify-center gap-2 text-[var(--text-dim)] hover:border-accent hover:text-accent hover:bg-accent/5 transition-all">
            <span className="text-3xl">+</span><span className="text-sm font-medium">Nueva NFC Card</span>
          </button>
        </div>
      )}
    </div>
  );
}
