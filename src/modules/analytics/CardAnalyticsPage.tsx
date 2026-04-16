import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsService } from '@/services/analytics.service';
import type { CardAnalyticsResponse } from '@/interfaces/api.interfaces';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, string> = {
    personal: '👤', business: '🏢', portfolio: '🎨', restaurant: '🍽️',
    medical: '🏥', academic: '🎓', event: '🎟️', product: '🛍️', blank: '⬡',
    gamer: '🎮', fitness: '💪', creator: '🎬', access: '🔑',
};

const ACTION_LABELS: Record<string, string> = {
    viewed: 'Visto',
    saved_contact: 'Contacto guardado',
    clicked_link: 'Link clickeado',
    called: 'Llamada',
    emailed: 'Email',
};

const DEVICE_COLORS: Record<string, string> = {
    ios: '#6366f1',
    android: '#06ffa5',
    desktop: '#f059da',
    other: '#6b6b8a',
};

const DAYS_OPTIONS = [7, 14, 30, 90];

export function CardAnalyticsPage() {
    const { cardId } = useParams<{ cardId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<CardAnalyticsResponse | null>(null);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!cardId) return;
        setLoading(true);
        analyticsService.cardAnalytics(cardId, days)
            .then(setData)
            .catch(() => toast.error('Error cargando analíticas'))
            .finally(() => setLoading(false));
    }, [cardId, days]);

    const dp = (k: keyof NonNullable<CardAnalyticsResponse['devices']>) => {
        if (!data) return 0;
        const t = Object.values(data.devices).reduce((a, b) => a + b, 0);
        return t > 0 ? Math.round((data.devices[k] / t) * 100) : 0;
    };

    // Build sorted scans_by_day for chart
    const scansByDay = data
        ? Object.entries(data.scans_by_day).sort(([a], [b]) => a.localeCompare(b)).slice(-30)
        : [];
    const maxScans = scansByDay.length > 0 ? Math.max(...scansByDay.map(([, v]) => v), 1) : 1;

    if (loading) return <div className="text-center py-20 text-[var(--text-dim)]">Cargando...</div>;
    if (!data) return <div className="text-center py-20 text-[var(--text-dim)]">Card no encontrada</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/analytics')}
                    className="btn btn-ghost text-sm px-3 py-1.5"
                >
                    ← Volver
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{TYPE_ICONS[data.card.type] || '◈'}</span>
                        <h1 className="font-syne text-2xl font-extrabold">{data.card.name}</h1>
                        <span className={data.card.status === 'active' ? 'badge-active' : 'badge-draft'}>
                            {data.card.status === 'active' ? '● Activa' : '◌ Borrador'}
                        </span>
                    </div>
                    <p className="text-xs font-mono text-[var(--text-dim)] mt-0.5 capitalize">
                        {data.card.type} · {data.card.scan_count} scans totales
                    </p>
                </div>
                {/* Período */}
                <div className="flex items-center gap-1 bg-surface2 rounded-xl p-1">
                    {DAYS_OPTIONS.map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${days === d
                                ? 'bg-accent text-black font-bold'
                                : 'text-[var(--text-dim)] hover:text-[var(--text)]'
                                }`}
                        >
                            {d}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Métricas clave */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { l: `Escaneos (${days}d)`, v: data.total, c: 'text-accent', i: '⚡' },
                    { l: 'Contactos guardados', v: data.saved_contacts, c: 'text-accent2', i: '💾' },
                    { l: 'Conversión', v: `${data.conversion_rate}%`, c: 'text-accent3', i: '📈' },
                    { l: 'Scans totales', v: data.card.scan_count, c: '', i: '◈' },
                ].map(s => (
                    <div key={s.l} className="card p-5 relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                        <div className="absolute top-4 right-4 text-xl opacity-15">{s.i}</div>
                        <div className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-dim)] mb-2">{s.l}</div>
                        <div className={`font-syne text-3xl font-extrabold ${s.c}`}>{s.v}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Dispositivos */}
                <div className="card p-6">
                    <h3 className="font-syne font-bold mb-4">Dispositivos</h3>
                    {(['ios', 'android', 'desktop', 'other'] as const).map(k => (
                        <div key={k} className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-[var(--text-dim)] capitalize">{k}</span>
                                <span className="font-mono text-xs">{dp(k)}% · {data.devices[k]}</span>
                            </div>
                            <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${dp(k)}%`, background: DEVICE_COLORS[k] }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Acciones */}
                <div className="card p-6">
                    <h3 className="font-syne font-bold mb-4">Acciones</h3>
                    {Object.entries(data.actions).length === 0
                        ? <div className="text-center py-8 text-[var(--text-dim)] text-sm">Sin acciones registradas</div>
                        : (['viewed', 'saved_contact', 'clicked_link', 'called', 'emailed'] as const).map(action => {
                            const count = data.actions[action] || 0;
                            const total = Object.values(data.actions).reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                                <div key={action} className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-[var(--text-dim)]">{ACTION_LABELS[action] || action}</span>
                                        <span className="font-mono text-xs">{pct}% · {count}</span>
                                    </div>
                                    <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, background: 'var(--accent)' }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

                {/* Scans por día (mini bar chart) */}
                <div className="card p-6">
                    <h3 className="font-syne font-bold mb-4">Escaneos por día</h3>
                    {scansByDay.length === 0
                        ? <div className="text-center py-8 text-[var(--text-dim)] text-sm">Sin escaneos en este período</div>
                        : (
                            <div className="flex items-end gap-1 h-28">
                                {scansByDay.map(([date, count]) => (
                                    <div
                                        key={date}
                                        className="flex-1 group relative flex flex-col items-center justify-end"
                                    >
                                        <div
                                            className="w-full rounded-t transition-all duration-300 bg-accent/60 hover:bg-accent min-h-[2px]"
                                            style={{ height: `${(count / maxScans) * 100}%` }}
                                        />
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface2 text-[10px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                            {count} · {date.slice(5)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>

            {/* Últimos escaneos */}
            <div className="card p-6 overflow-x-auto">
                <h3 className="font-syne font-bold mb-4">Últimos escaneos</h3>
                {data.scans.length === 0
                    ? <div className="text-center py-10 text-[var(--text-dim)] text-sm">Sin escaneos aún</div>
                    : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-dim)] border-b border-[var(--border)]">
                                    <th className="text-left pb-2 pr-4">Fecha</th>
                                    <th className="text-left pb-2 pr-4">Hora</th>
                                    <th className="text-left pb-2 pr-4">Dispositivo</th>
                                    <th className="text-left pb-2 pr-4">Acción</th>
                                    <th className="text-left pb-2">Ciudad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.scans.slice(0, 50).map(s => (
                                    <tr key={s.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-accent/3 transition-colors">
                                        <td className="py-2.5 pr-4 font-mono text-xs text-[var(--text-dim)]">
                                            {new Date(s.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="py-2.5 pr-4 font-mono text-xs text-[var(--text-dim)]">
                                            {new Date(s.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="py-2.5 pr-4 text-xs capitalize">{s.device_type}</td>
                                        <td className="py-2.5 pr-4 text-xs text-accent2">
                                            {ACTION_LABELS[s.action] || s.action.replace('_', ' ')}
                                        </td>
                                        <td className="py-2.5 text-xs text-[var(--text-dim)]">{s.ip_city || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                }
            </div>
        </div>
    );
}
