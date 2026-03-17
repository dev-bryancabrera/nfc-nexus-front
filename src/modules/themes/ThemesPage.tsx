import { useState } from 'react';
import toast from 'react-hot-toast';
import { useThemeStore, THEMES } from '../../store/theme.store';

export function ThemesPage() {
  const { activeTheme, setTheme } = useThemeStore();
  const [applying, setApplying] = useState<string | null>(null);

  const handleApply = async (id: string) => {
    if (id === activeTheme) return;
    setApplying(id);
    // small delay for visual feedback
    await new Promise(r => setTimeout(r, 300));
    setTheme(id);
    setApplying(null);
    const theme = THEMES.find(t => t.id === id);
    toast.success(`Tema "${theme?.name}" aplicado`);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="section-title">Temas</h1>
        <p className="text-sm text-[var(--text-dim)] mt-1">
          Personaliza la apariencia visual de tu panel. El tema activo se aplica inmediatamente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {THEMES.map(t => {
          const isActive = activeTheme === t.id;
          const isApplying = applying === t.id;

          return (
            <div
              key={t.id}
              className={`card overflow-hidden transition-all duration-200 ${
                isActive
                  ? 'border-[var(--accent)] shadow-[var(--glow)] scale-[1.01]'
                  : 'card-hover cursor-pointer'
              }`}
              onClick={() => handleApply(t.id)}
            >
              {/* Preview gradient */}
              <div className="h-32 relative" style={{ background: t.preview }}>
                {/* Simulated mini UI inside the preview */}
                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full opacity-60" style={{ background: t.dot }} />
                    <div className="flex-1 h-1.5 rounded-full opacity-20 bg-white" />
                    <div className="w-6 h-1.5 rounded-full opacity-40" style={{ background: t.dot }} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="w-16 h-2 rounded-full opacity-70 bg-white" />
                    <div className="w-24 h-1.5 rounded-full opacity-30 bg-white" />
                  </div>
                </div>
                {/* Accent dot */}
                <div
                  className="absolute bottom-3 right-3 w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-xs shadow-lg"
                  style={{ background: t.dot }}
                >
                  {isApplying ? (
                    <span className="animate-spin text-white">⟳</span>
                  ) : isActive ? (
                    <span className="text-white font-bold">✓</span>
                  ) : (
                    <span>◈</span>
                  )}
                </div>

                {/* Active badge */}
                {isActive && (
                  <div className="absolute top-3 left-3">
                    <span className="badge-active text-[9px] px-2 py-0.5">● ACTIVO</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-syne font-bold text-sm">{t.name}</div>
                  {!isActive && (
                    <button
                      className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                      onClick={e => { e.stopPropagation(); handleApply(t.id); }}
                    >
                      {isApplying ? 'Aplicando...' : 'Aplicar'}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-dim)] leading-snug">{t.description}</p>

                {/* Color swatches */}
                <div className="flex gap-1.5 mt-3">
                  {[t.vars['--bg'], t.vars['--surface'], t.dot, t.vars['--accent2'] ?? t.dot, t.vars['--accent3'] ?? t.dot].map((c, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border border-white/10"
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="mt-8 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-start gap-3">
        <span className="text-lg mt-0.5" style={{ color: 'var(--accent)' }}>ℹ</span>
        <div>
          <div className="text-sm font-semibold mb-0.5">Sobre los temas</div>
          <p className="text-xs text-[var(--text-dim)]">
            El tema seleccionado se guarda en tu dispositivo y se aplica automáticamente cada vez que inicies sesión.
            Los temas solo afectan la apariencia del panel de administración, no el perfil público de tus tarjetas.
          </p>
        </div>
      </div>
    </div>
  );
}