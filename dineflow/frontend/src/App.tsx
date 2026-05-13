import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Admin pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import ThemePage from './pages/ThemePage';
import QRPage from './pages/QRPage';
import ReviewsPage from './pages/ReviewsPage';
import SettingsPage from './pages/SettingsPage';
import VenuePage from './pages/VenuePage';

// Guest page
import GuestMenuPage from './pages/GuestMenuPage';

// Layout
import AdminLayout from './components/AdminLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ── Guest menu — public, no login ── */}
        <Route path="/menu/:slug" element={<GuestMenuPage />} />
        
        {/* ── Auth ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage mode="register" />} />
        
        {/* ── Admin — protected ── */}
        <Route path="/admin" element={
          <ProtectedRoute><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="venue" element={<VenuePage />} />
          <Route path="theme" element={<ThemePage />} />
          <Route path="qr" element={<QRPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
       </Routes>
    </BrowserRouter>
  );
}
