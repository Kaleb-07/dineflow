import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../lib/axios';

interface Props {
  mode?: 'login' | 'register';
}

export default function LoginPage({ mode = 'login' }: Props) {
  const navigate = useNavigate();
  const setAuth = useStore((s) => s.setAuth);
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    venueName: '', venueSlug: ''
  });
  
  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    // auto-generate slug from venue name
    if (k === 'venueName') {
      setForm(p => ({
        ...p, venueName: v,
        venueSlug: v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));
    }
  };
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, form);
      setAuth(data.token, data.user, data.venue);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-amber-400 mb-1">DineFlow</div>
          <div className="text-gray-400 text-sm tracking-widest uppercase">
            Digital Menu Platform
          </div>
        </div>
        
        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-white text-xl font-semibold mb-6">
            {isLogin ? 'Sign in to your account' : 'Create your venue'}
          </h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}
          
          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <Input label="Your name" value={form.name}
                onChange={v => set('name', v)} placeholder="John Doe" />
            )}
            
            <Input label="Email" type="email" value={form.email}
              onChange={v => set('email', v)} placeholder="you@example.com" />
            
            <Input label="Password" type="password" value={form.password}
              onChange={v => set('password', v)} placeholder="••••••••" />
            
            {!isLogin && (
              <>
                <Input label="Venue / Restaurant name" value={form.venueName}
                  onChange={v => set('venueName', v)} placeholder="Noora Hotel" />
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">
                    Menu URL
                  </label>
                  <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    <span className="text-gray-500 text-sm px-3 border-r border-gray-700 py-2.5 whitespace-nowrap">
                      dineflow.app/menu/
                    </span>
                    <input
                      className="bg-transparent text-white text-sm px-3 py-2.5 flex-1 outline-none"
                      value={form.venueSlug}
                      onChange={e => set('venueSlug', e.target.value)}
                      placeholder="noora-hotel"
                    />
                  </div>
                </div>
              </>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-amber-400 hover:text-amber-300"
            >
              {isLogin ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 outline-none focus:border-amber-500 transition-colors placeholder-gray-600"
      />
    </div>
  );
}
