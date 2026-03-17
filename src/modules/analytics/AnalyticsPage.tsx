import { useEffect, useState } from 'react';
import type { AnalyticsOverview, Scan } from '../types';
import toast from 'react-hot-toast';
import { analyticsService } from '@/services/analytics.service';

export function AnalyticsPage() {
    const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
    const [scans, setScans] = useState<Scan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([analyticsService.overview(), analyticsService.recentScans(25)])
            .then(([o, s]) => { setOverview(o); setScans(s.scans); })
            .catch(() => toast.error('Error cargando analíticas'))
            .finally(() => setLoading(false));
    }, []);

    const dp = (k: keyof AnalyticsOverview['devices']) => {
        if (!overview) return 0;
        const t = Object.values(overview.devices).reduce((a, b) => a + b, 0);
        return t > 0 ? Math.round((overview.devices[k] / t) * 100) : 0;
    };

    if (loading) return <div className="text-center py-20 text-[var(--text-dim)]">Cargando...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="section-title">Analíticas</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { l: 'Escaneos (30d)', v: overview?.total_scans ?? 0, c: 'text-accent', i: '⚡' },
                    { l: 'Cards activas', v: overview?.active_cards ?? 0, c: '', i: '◈' },
                    { l: 'Contactos', v: overview?.saved_contacts ?? 0, c: 'text-accent2', i: '💾' },
                    { l: 'Conversión', v: `${overview?.conversion_rate ?? 0}%`, c: 'text-accent3', i: '📈' },
                ].map(s => (
                    <div key={s.l} className="card p-5 relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-xl opacity-15">{s.i}</div>
                        <div className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-dim)] mb-2">{s.l}</div>
                        <div className={`font-syne text-3xl font-extrabold ${s.c}`}>{s.v}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="card p-6">
                    <h3 className="font-syne font-bold mb-4">Dispositivos</h3>
                    {(['ios', 'android', 'desktop', 'other'] as const).map((k, _, arr) => (
                        <div key={k} className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-[var(--text-dim)] capitalize">{k}</span>
                                <span className="font-mono text-xs">{dp(k)}% · {overview?.devices[k] ?? 0}</span>
                            </div>
                            <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${dp(k)}%`, background: ['#6366f1', '#06ffa5', '#f059da', '#6b6b8a'][arr.indexOf(k)] }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-2 card p-6 overflow-x-auto">
                    <h3 className="font-syne font-bold mb-4">Últimos escaneos</h3>
                    {scans.length === 0 ? <div className="text-center py-10 text-[var(--text-dim)] text-sm">Sin escaneos aún</div> : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-mono tracking-widest uppercase text-[var(--text-dim)] border-b border-[var(--border)]">
                                    <th className="text-left pb-2 pr-4">Hora</th>
                                    <th className="text-left pb-2 pr-4">Card</th>
                                    <th className="text-left pb-2 pr-4">Dispositivo</th>
                                    <th className="text-left pb-2">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scans.map(s => (
                                    <tr key={s.id} className="border-b border-[rgba(255,255,255,0.03)]">
                                        <td className="py-2.5 pr-4 font-mono text-xs text-[var(--text-dim)]">{new Date(s.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="py-2.5 pr-4 text-xs truncate max-w-[100px]">{s.cards?.name || '—'}</td>
                                        <td className="py-2.5 pr-4 text-xs capitalize">{s.device_type}</td>
                                        <td className="py-2.5 text-xs text-accent2">{s.action.replace('_', ' ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}