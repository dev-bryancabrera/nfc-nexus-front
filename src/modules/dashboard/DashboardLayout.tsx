import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard',           label: 'Dashboard',    icon: '⬡', end: true },
  { to: '/dashboard/cards',     label: 'Mis Cards',    icon: '◈' },
  { to: '/dashboard/editor',    label: 'Editor',       icon: '✦' },
  { divider: 'Herramientas' },
  { to: '/dashboard/analytics', label: 'Analíticas',   icon: '◎' },
  { to: '/dashboard/qr',        label: 'Generador QR', icon: '⊞' },
  { to: '/dashboard/write',     label: 'Escribir NFC', icon: '⟁' },
  { divider: 'Cuenta' },
  { to: '/dashboard/themes',    label: 'Temas',        icon: '◉' },
  { to: '/dashboard/settings',  label: 'Ajustes',      icon: '⚙' },
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Network error during logout, forcing clear', error);
    } finally {
      clear();
      toast.success('Sesión cerrada');
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen relative z-10">
      <aside className={`fixed top-0 left-0 bottom-0 w-60 bg-surface border-r border-[var(--border)] flex flex-col z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-6 py-5 border-b border-[var(--border)]">
          <div className="font-syne text-xl font-extrabold gradient-text">BRTECH NFC</div>
          <div className="text-[9px] font-mono text-[var(--text-dim)] tracking-widest mt-0.5">SMART CARD PLATFORM v3</div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {NAV.map((item, i) => {
            if ('divider' in item) return (
              <div key={i} className="text-[9px] font-mono text-[var(--text-dim)] tracking-widest uppercase px-3 pt-4 pb-1.5">{item.divider}</div>
            );
            return (
              <NavLink key={item.to} to={item.to!} end={item.end} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all ${isActive ? 'bg-accent/15 text-accent shadow-[inset_3px_0_0_var(--accent)]' : 'text-[var(--text-dim)] hover:bg-accent/8 hover:text-[var(--text)]'}`
                }>
                <span className="text-base w-5 text-center">{item.icon}</span>{item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2.5 mb-3">
            {user?.avatar_url
              ? <img src={user.avatar_url} className="w-8 h-8 rounded-full object-cover border border-accent/20" />
              : <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-sm">{user?.avatar_emoji || '🚀'}</div>
            }
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-tight truncate">{user?.full_name || 'Usuario'}</div>
              <div className="text-[10px] font-mono text-[var(--text-dim)] truncate">@{user?.username}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost text-xs w-full justify-center opacity-60 hover:opacity-100 hover:text-danger">← Cerrar sesión</button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 ml-0 lg:ml-60 min-h-screen">
        <header className="h-16 border-b border-[var(--border)] flex items-center px-6 gap-3 sticky top-0 z-30 bg-[rgba(5,5,8,0.85)] backdrop-blur-xl">
          <button className="lg:hidden text-2xl" onClick={() => setOpen(true)}>☰</button>
          <div className="flex-1" />
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/editor')}>+ Nueva Card</button>
        </header>
        <main className="p-6 lg:p-8 animate-fade-in"><Outlet /></main>
      </div>
    </div>
  );
}
