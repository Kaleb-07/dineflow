import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import {
  LayoutDashboard, UtensilsCrossed, Building2,
  Palette, QrCode, Star, Settings, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const nav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/admin/venue', icon: Building2, label: 'Venue' },
  { to: '/admin/theme', icon: Palette, label: 'Branding' },
  { to: '/admin/qr', icon: QrCode, label: 'QR Codes' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, venue, clearAuth } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const logout = () => { clearAuth(); navigate('/login'); };
  
  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="text-amber-400 font-bold text-xl">DineFlow</div>
        <div className="text-gray-500 text-xs mt-0.5 truncate">{venue?.name}</div>
      </div>
      
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
      
      {/* User + logout */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-medium">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.name}</div>
            <div className="text-gray-500 text-xs truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-sm transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-gray-800">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-gray-900 border-r border-gray-800 flex-shrink-0">
        <Sidebar />
      </aside>
      
      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
            <Sidebar mobile />
          </aside>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 flex-shrink-0">
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <a
              href={`/menu/${venue?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-400 border border-amber-500/30 hover:border-amber-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              View guest menu ↗
            </a>
          </div>
        </header>
        
        {/* Page contents */}
        <main className="flex-1 overflow-y-auto bg-gray-950 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
