import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, QrCode, Star, Palette, ArrowRight } from 'lucide-react';
import api from '../lib/axios';

export default function DashboardPage() {
  const { venue, user } = useStore();
  const [stats, setStats] = useState({ items: 0, qrCodes: 0, reviews: 0, avgRating: 0 });
  
  useEffect(() => {
    Promise.all([
      api.get('/items'),
      api.get('/reviews'),
    ]).then(([items, reviews]) => {
      const ratings = reviews.data.map((r: any) => r.rating);
      setStats({
        items: items.data.length,
        qrCodes: 0,
        reviews: reviews.data.length,
        avgRating: ratings.length
          ? (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1) as any
          : 0
      });
    }).catch(() => {});
  }, []);
  
  const cards = [
    { label: 'Menu items', value: stats.items, icon: UtensilsCrossed, to: '/admin/menu', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'QR codes', value: stats.qrCodes, icon: QrCode, to: '/admin/qr', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Reviews', value: stats.reviews, icon: Star, to: '/admin/reviews', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Avg rating', value: `${stats.avgRating} ★`, icon: Star, to: '/admin/reviews', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];
  
  const quickLinks = [
    { label: 'Add menu items', to: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Customize branding', to: '/admin/theme', icon: Palette },
    { label: 'Generate QR codes', to: '/admin/qr', icon: QrCode },
  ];
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 mt-1">{venue?.name}</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, to, color, bg }) => (
          <Link key={label} to={to}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
            <div className={`w-9 h-9 ${bg} ${color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-semibold text-white">{value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{label}</div>
          </Link>
        ))}
      </div>
      
      {/* Guest menu link */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-6">
        <div className="text-amber-400 font-medium mb-1">Your guest menu is live</div>
        <div className="text-gray-400 text-sm mb-3">
          Share this link or generate QR codes for tables
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="bg-gray-900 text-amber-300 text-sm px-3 py-1.5 rounded-lg border border-gray-800">
            {window.location.origin}/menu/{venue?.slug}
          </code>
          <a
            href={`/menu/${venue?.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Open <ArrowRight size={14} />
          </a>
        </div>
      </div>
      
      {/* Quick links */}
      <div>
        <h2 className="text-gray-400 text-xs uppercase tracking-widest mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickLinks.map(({ label, to, icon: Icon }) => (
            <Link key={to} to={to}
              className="flex items-center justify-between bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-3.5 transition-colors group">
              <div className="flex items-center gap-3 text-gray-300 group-hover:text-white text-sm">
                <Icon size={16} className="text-gray-500" /> {label}
              </div>
              <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
