import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCardsStore } from '../../store/cards.store';

export function WritePage() {
    const loc = useLocation();
    const { cards, fetchCards } = useCardsStore();
    const [url, setUrl] = useState<string>(loc.state?.url || '');
    const [name, setName] = useState<string>(loc.state?.name || '');
    useEffect(() => { fetchCards(); }, []);

    return (
        <div className="animate-fade-in max-w-2xl">
            <h1 className="section-title mb-6">Escribir en Tarjeta NFC</h1>
            <div className="space-y-4">
                <div className="card p-6">
                    <h3 className="text-sm font-bold mb-3">Seleccionar card</h3>
                    <select className="input mb-3" value={url} onChange={e => { setUrl(e.target.value); const c = cards.find(c => c.public_url === e.target.value); setName(c?.name || ''); }}>
                        <option value="">— Elige una card activa —</option>
                        {cards.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.public_url}>{c.name}</option>)}
                    </select>
                    {url && <div className="url-box"><span className="truncate flex-1 text-xs">{url}</span>
                        <button onClick={() => { navigator.clipboard.writeText(url); toast.success('Copiado'); }} className="text-xs bg-accent2/10 border border-accent2/30 rounded px-2 py-1 text-accent2 whitespace-nowrap">Copiar</button></div>}
                </div>
                {url && (
                    <div className="card p-8 text-center" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
                        <div className="inline-flex w-20 h-20 rounded-full bg-accent/20 items-center justify-center text-4xl mb-4 animate-pulse-slow">⟁</div>
                        <div className="font-syne font-bold text-xl mb-1">{name}</div>
                        <div className="text-sm text-[var(--text-dim)] mb-4">Copia la URL y sigue los pasos</div>
                        <button onClick={() => { navigator.clipboard.writeText(url); toast.success('URL copiada'); }} className="btn btn-success justify-center mx-auto">Copiar URL</button>
                    </div>
                )}
                <div className="card p-6">
                    <h3 className="text-sm font-bold mb-4">Instrucciones</h3>
                    <div className="space-y-3">
                        {[[1, 'Copia la URL', 'Pulsa "Copiar URL" arriba'], [2, 'Abre NFC Tools → Write → URL/URI', 'Gratis en App Store y Google Play'], [3, 'Pega y acerca la tarjeta NFC', 'Mantén hasta que confirme'], [4, '¡Prueba!', 'iOS 13+ y Android con NFC — sin apps']].map(([n, t, d]) => (
                            <div key={n} className="flex gap-3 bg-bg border border-[var(--border)] rounded-xl p-4">
                                <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{n}</div>
                                <div><div className="text-sm font-semibold">{t}</div><div className="text-xs text-[var(--text-dim)] mt-0.5">{d}</div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}