import { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { useCardsStore } from '../../store/cards.store';

export function QRPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [url, setUrl] = useState('https://nexusnfc.com/u/mi-perfil');
    const [fg, setFg] = useState('#6366f1');
    const [bg, setBg] = useState('#050508');
    const { cards, fetchCards } = useCardsStore();
    useEffect(() => { fetchCards(); }, []);
    useEffect(() => {
        if (!canvasRef.current || !url) return;
        QRCode.toCanvas(canvasRef.current, url, { width: 240, margin: 2, color: { dark: fg, light: bg } }).catch(() => { });
    }, [url, fg, bg]);

    return (
        <div className="animate-fade-in">
            <h1 className="section-title mb-6">Generador QR + NFC</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="card p-6 space-y-3">
                        <h3 className="text-sm font-bold">Configuración</h3>
                        <div><label className="label">Usar una de mis cards</label>
                            <select className="input" onChange={e => e.target.value && setUrl(e.target.value)}>
                                <option value="">— URL personalizada —</option>
                                {cards.filter(c => c.status === 'active').map(c => <option key={c.id} value={c.public_url}>{c.name}</option>)}
                            </select></div>
                        <div><label className="label">URL</label><input className="input" value={url} onChange={e => setUrl(e.target.value)} /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="label">Color QR</label>
                                <div className="flex gap-2"><input type="color" value={fg} onChange={e => setFg(e.target.value)} className="w-10 h-9 rounded cursor-pointer" /><input className="input flex-1" value={fg} onChange={e => setFg(e.target.value)} /></div></div>
                            <div><label className="label">Fondo</label>
                                <div className="flex gap-2"><input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-10 h-9 rounded cursor-pointer" /><input className="input flex-1" value={bg} onChange={e => setBg(e.target.value)} /></div></div>
                        </div>
                    </div>
                    <div className="url-box text-xs">
                        <span className="truncate flex-1">{url}</span>
                        <button onClick={() => { navigator.clipboard.writeText(url); toast.success('Copiado'); }} className="text-xs bg-accent2/10 border border-accent2/30 rounded px-2 py-1 text-accent2 whitespace-nowrap">Copiar</button>
                    </div>
                </div>
                <div className="card p-6 flex flex-col items-center">
                    <h3 className="text-sm font-bold mb-5 self-start">Vista previa</h3>
                    <div className="w-64 h-64 rounded-2xl flex items-center justify-center mb-5" style={{ background: bg }}>
                        <canvas ref={canvasRef} />
                    </div>
                    <button onClick={() => { const c = canvasRef.current; if (!c) return; Object.assign(document.createElement('a'), { download: 'nexus-qr.png', href: c.toDataURL() }).click(); toast.success('Descargado'); }}
                        className="btn btn-primary w-full justify-center">⬇ Descargar PNG</button>
                </div>
            </div>
        </div>
    );
}
