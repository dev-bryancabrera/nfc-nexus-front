import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import { useThemeStore } from './store/theme.store';
import { domainLib } from './lib/domain';

import LoginPage from './modules/auth/LoginPage';
import AuthCallbackPage from './modules/auth/AuthCallbackPage';
import DashboardLayout from './modules/dashboard/DashboardLayout';
import DashboardHome from './modules/dashboard/DashboardHome';
import EditorPage from './modules/editor/EditorPage';
import PublicProfilePage from './modules/public/PublicProfilePage';
import { CardsPage } from './modules/cards/CardsPage';
import { AnalyticsPage } from './modules/analytics/AnalyticsPage';
import { QRPage } from './modules/qr/QRPage';
import { WritePage } from './modules/write/WritePage';
import { ThemesPage } from './modules/themes/ThemesPage';
import { SettingsPage } from './modules/settings/SettingsPage';

const Guard = ({ children }: { children: React.ReactNode }) =>
  useAuthStore(s => s.isAuthenticated) ? <>{children}</> : <Navigate to="/login" replace />;

const GuestOnly = ({ children }: { children: React.ReactNode }) =>
  useAuthStore(s => s.isAuthenticated) ? <Navigate to="/dashboard" replace /> : <>{children}</>;

const toastStyle = {
  style: { background: '#0d0d14', color: '#e8e8f0', border: '1px solid rgba(255,255,255,0.07)', fontFamily: 'Outfit, sans-serif', fontSize: '14px' },
  success: { iconTheme: { primary: '#06ffa5', secondary: '#050508' } },
  error:   { iconTheme: { primary: '#ff4757', secondary: '#050508' } },
};

export default function App() {
  const initTheme = useThemeStore(s => s.initTheme);
  useEffect(() => { initTheme(); }, [initTheme]);

  // Subdomain mode: serve public profile directly
  const subdomainSlug = domainLib.getSubdomainSlug();
  if (subdomainSlug) return (
    <><Toaster position="bottom-right" toastOptions={toastStyle} /><PublicProfilePage slugOverride={subdomainSlug} /></>
  );

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={toastStyle} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/u/:slug" element={<PublicProfilePage />} />

        <Route path="/dashboard" element={<Guard><DashboardLayout /></Guard>}>
          <Route index element={<DashboardHome />} />
          <Route path="cards"          element={<CardsPage />} />
          <Route path="editor"         element={<EditorPage />} />
          <Route path="editor/:cardId" element={<EditorPage />} />
          <Route path="analytics"      element={<AnalyticsPage />} />
          <Route path="qr"             element={<QRPage />} />
          <Route path="write"          element={<WritePage />} />
          <Route path="themes"         element={<ThemesPage />} />
          <Route path="settings"       element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
