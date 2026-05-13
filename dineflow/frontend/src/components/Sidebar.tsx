import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu, Palette, QrCode, Star, Settings, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useStore();

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/menu', icon: Menu, label: 'Menu' },
    { to: '/admin/theme', icon: Palette, label: 'Theme' },
    { to: '/admin/qr', icon: QrCode, label: 'QR Codes' },
    { to: '/admin/reviews', icon: Star, label: 'Reviews' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">DineFlow</h1>
      </div>

      <nav className="flex-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 w-full transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
