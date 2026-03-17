import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import toast from 'react-hot-toast';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event !== 'SIGNED_IN' || !session || handled.current) return;
        handled.current = true;

        try {
          const result = await authService.handleCallback(session.access_token, session.refresh_token);
          setAuth(
            { ...result.profile, user_id: result.user.id, email: result.user.email },
            { access_token: session.access_token, refresh_token: session.refresh_token }
          );
          toast.success(`¡Bienvenido${result.profile.full_name ? ', ' + result.profile.full_name.split(' ')[0] : ''}!`);
          navigate('/dashboard', { replace: true });
        } catch (err) {
          console.error('Callback error:', err);
          toast.error('Error al configurar tu cuenta');
          navigate('/login', { replace: true });
        }
      }
    );

    const timeout = setTimeout(() => {
      if (!handled.current) {
        toast.error('Tiempo agotado. Intenta de nuevo.');
        navigate('/login', { replace: true });
      }
    }, 10000);

    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative z-10">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">⟁</div>
        <div className="font-syne text-xl font-bold gradient-text mb-2">Conectando con Google...</div>
        <div className="text-sm text-[var(--text-dim)] font-mono tracking-wider">Configurando tu cuenta</div>
      </div>
    </div>
  );
}
