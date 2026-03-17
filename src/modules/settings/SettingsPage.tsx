import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth.store';
import { usersService } from '../../services/user.service';
import type { DomainMode, AuthSession } from '../../types';

export function SettingsPage() {
    const { user, setAuth, accessToken, refreshTokenValue } = useAuthStore();
    const [form, setForm] = useState({ full_name: user?.full_name || '', avatar_emoji: user?.avatar_emoji || '🚀', domain_mode: (user?.domain_mode || 'path') as DomainMode });
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const profile = await usersService.updateProfile(form);
            setAuth(profile, { access_token: accessToken!, refresh_token: refreshTokenValue! } as AuthSession);
            toast.success('Guardado');
        } catch { toast.error('Error guardando'); } finally { setSaving(false); }
    };

    return (
        <div className="animate-fade-in max-w-xl space-y-5">
            <h1 className="section-title">Ajustes</h1>
            <div className="card p-6">
                <h3 className="text-sm font-bold mb-4">Mi cuenta</h3>
                <div className="flex items-center gap-4 mb-5 p-4 bg-bg rounded-xl border border-[var(--border)]">
                    {user?.avatar_url ? <img src={user.avatar_url} className="w-14 h-14 rounded-full object-cover border-2 border-accent/30" />
                        : <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-2xl">{form.avatar_emoji}</div>}
                    <div>
                        <div className="font-syne font-bold">{user?.full_name}</div>
                        <div className="text-sm text-[var(--text-dim)]">@{user?.username}</div>
                        <div className="text-xs text-accent2 mt-0.5">Plan {user?.plan?.toUpperCase()}</div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div><label className="label">Nombre completo</label><input className="input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
                    <div><label className="label">Emoji avatar</label><input className="input w-24" value={form.avatar_emoji} maxLength={2} onChange={e => setForm({ ...form, avatar_emoji: e.target.value })} /></div>
                </div>
            </div>
            <div className="card p-6">
                <h3 className="text-sm font-bold mb-3">Modo de URL</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    {([['path', '⬡ Path', '/u/slug'], ['subdomain', '◈ Subdominio', 'slug.nexusnfc.com']] as [DomainMode, string, string][]).map(([v, l, ex]) => (
                        <button key={v} onClick={() => setForm({ ...form, domain_mode: v })}
                            className={`p-4 rounded-xl border text-left transition-all ${form.domain_mode === v ? 'border-accent bg-accent/10' : 'border-[var(--border)] bg-bg hover:border-accent/40'}`}>
                            <div className="text-sm font-bold mb-1">{l}</div>
                            <div className="text-[10px] font-mono text-[var(--text-dim)]">{ex}</div>
                        </button>
                    ))}
                </div>
                <p className="text-[10px] font-mono text-warn">⚠ Cambiar el modo reconstruye todas tus URLs</p>
            </div>
            <button onClick={save} disabled={saving} className="btn btn-primary w-full justify-center py-3">{saving ? 'Guardando...' : 'Guardar ajustes'}</button>
        </div>
    );
}
