import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/dashboard',           label: 'Dashboard',    icon: '⬡', end: true },
  { to: '/dashboard/cards',     label: 'Mis Cards',    icon: '◈' },
  { divider: 'Herramientas' },
  { to: '/dashboard/analytics', label: 'Analíticas',   icon: '◎' },
  { to: '/dashboard/qr',        label: 'Generador QR', icon: '⊞' },
  { to: '/dashboard/write',     label: 'Escribir NFC', icon: '⟁' },
  { divider: 'Cuenta' },
  { to: '/dashboard/themes',    label: 'Temas',        icon: '◉' },
  { to: '/dashboard/settings',  label: 'Ajustes',      icon: '⚙' },
];

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const { user, clear } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isInEditor = location.pathname.startsWith('/dashboard/editor');

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    try { await authService.logout(); }
    catch (error) { console.warn('Network error during logout, forcing clear', error); }
    finally { clear(); toast.success('Sesión cerrada'); navigate('/login'); }
  };

  const sw = collapsed ? 'w-16' : 'w-60';
  const ml = collapsed ? 'lg:ml-16' : 'lg:ml-60';

  return (
    <div className="flex min-h-screen relative z-10">
      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 bottom-0 ${sw} bg-surface border-r border-[var(--border)] flex flex-col z-50 transition-all duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo + collapse toggle */}
        <div className={`px-4 py-5 border-b border-[var(--border)] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {collapsed
            ? <div className="font-syne text-lg font-extrabold gradient-text">N</div>
            : <div>
                <div className="font-syne text-xl font-extrabold gradient-text">BRTECH NFC</div>
                <div className="text-[9px] font-mono text-[var(--text-dim)] tracking-widest mt-0.5">SMART CARD PLATFORM v3</div>
              </div>
          }
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex w-6 h-6 rounded-md items-center justify-center text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-accent/10 transition-all flex-shrink-0"
            title={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            {collapsed ? '⊞' : '⊟'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {NAV.map((item, i) => {
            if ('divider' in item) {
              if (collapsed) return null;
              return <div key={i} className="text-[9px] font-mono text-[var(--text-dim)] tracking-widest uppercase px-3 pt-4 pb-1.5">{item.divider}</div>;
            }
            return (
              <NavLink
                key={item.to} to={item.to!} end={item.end}
                onClick={() => setMobileOpen(false)}
                title={item.label}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 px-3'} py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all
                  ${isActive ? 'bg-accent/15 text-accent shadow-[inset_3px_0_0_var(--accent)]' : 'text-[var(--text-dim)] hover:bg-accent/8 hover:text-[var(--text)]'}`
                }
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border)]">
          {/* User info */}
          <div className={`flex items-center gap-2.5 mb-2 ${collapsed ? 'justify-center' : ''}`}>
            {user?.avatar_url
              ? <img src={user.avatar_url} className="w-8 h-8 rounded-full object-cover border border-accent/20 flex-shrink-0" />
              : <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-sm flex-shrink-0">{user?.avatar_emoji || '🚀'}</div>
            }
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight truncate">{user?.full_name || 'Usuario'}</div>
                <div className="text-[10px] font-mono text-[var(--text-dim)] truncate">@{user?.username}</div>
              </div>
            )}
          </div>

          {/* Logout — only when expanded */}
          {!collapsed && (
            <button onClick={handleLogout} className="btn btn-ghost text-xs w-full justify-center opacity-60 hover:opacity-100 hover:text-danger">
              ← Cerrar sesión
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* ── Main content ── */}
      <div className={`flex-1 ml-0 ${ml} min-h-screen transition-all duration-300`}>
        <header className="h-16 border-b border-[var(--border)] flex items-center px-6 gap-3 sticky top-0 z-30 bg-[rgba(5,5,8,0.85)] backdrop-blur-xl">
          <button className="lg:hidden text-2xl" onClick={() => setMobileOpen(true)}>☰</button>
          <div className="flex-1" />
          {!isInEditor && (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/editor')}>+ Nueva Card</button>
          )}
        </header>
        <main className="p-6 lg:p-8 animate-fade-in"><Outlet /></main>
      </div>
    </div>
  );
}
