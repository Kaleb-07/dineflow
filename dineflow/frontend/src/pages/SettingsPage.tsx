import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Copy, Check, ExternalLink } from 'lucide-react';
import api from '../lib/axios';

export default function SettingsPage() {
  const { user, venue, clearAuth } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'account' | 'venue' | 'danger'>('account');
  const [copied, setCopied] = useState(false);

  // Account form
  const [name,     setName]     = useState(user?.name     || '');
  const [email,    setEmail]    = useState(user?.email    || '');
  const [password, setPassword] = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  // Venue settings
  const [currency, setCurrency] = useState(venue?.currency || 'ETB');
  const [language, setLanguage] = useState('en');

  const saveAccount = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch('/settings/account', {
        name, email,
        ...(newPass ? { currentPassword: password, newPassword: newPass } : {})
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveVenue = async () => {
    setSaving(true);
    try {
      await api.patch('/settings', { currency, language });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/menu/${venue?.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const logout = () => { clearAuth(); navigate('/login'); };

  const deleteVenue = async () => {
    const confirm1 = window.confirm(
      'Are you sure? This will permanently delete all your menu items, QR codes, and reviews.'
    );
    if (!confirm1) return;
    const typed = window.prompt(`Type your venue name "${venue?.name}" to confirm:`);
    if (typed !== venue?.name) return alert('Name did not match. Cancelled.');
    await api.delete('/settings/venue');
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Account and venue configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
        {(['account','venue','danger'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm capitalize transition-colors ${
              tab === t
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:text-white'
            }`}>
            {t === 'danger' ? '⚠ Danger zone' : t}
          </button>
        ))}
      </div>

      {/* ── Account ── */}
      {tab === 'account' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <Field label="Display name">
            <input className={inp} value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </Field>
          <div className="border-t border-gray-800 pt-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Change password</div>
            <div className="space-y-3">
              <Field label="Current password">
                <input className={inp} type="password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
              </Field>
              <Field label="New password">
                <input className={inp} type="password" value={newPass}
                  onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" />
              </Field>
            </div>
          </div>
          <button onClick={saveAccount} disabled={saving}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 text-sm font-semibold rounded-lg transition-colors">
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:text-red-400 text-sm transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}

      {/* ── Venue settings ── */}
      {tab === 'venue' && (
        <div className="space-y-4">
          {/* Menu link */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Your guest menu link</div>
            <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <code className="text-amber-300 text-sm flex-1 truncate">
                {window.location.origin}/menu/{venue?.slug}
              </code>
              <button onClick={copyLink} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
              </button>
              <a href={`/menu/${venue?.slug}`} target="_blank" rel="noreferrer"
                className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
                <ExternalLink size={15} />
              </a>
            </div>
          </div>

          {/* Currency + language */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <Field label="Currency">
              <select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="ETB">ETB — Ethiopian Birr</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="UGX">UGX — Ugandan Shilling</option>
                <option value="TZS">TZS — Tanzanian Shilling</option>
                <option value="ZAR">ZAR — South African Rand</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="AED">AED — UAE Dirham</option>
              </select>
            </Field>
            <Field label="Default language">
              <select className={inp} value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="am">Amharic</option>
                <option value="ar">Arabic</option>
                <option value="fr">French</option>
                <option value="sw">Swahili</option>
              </select>
            </Field>
            <button onClick={saveVenue} disabled={saving}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 text-sm font-semibold rounded-lg transition-colors">
              {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>
      )}

      {/* ── Danger zone ── */}
      {tab === 'danger' && (
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-5 space-y-4">
          <div className="text-red-400 text-sm font-medium">Danger zone</div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Deleting your venue is permanent and cannot be undone. All menu items, QR codes, reviews, and branding will be deleted immediately.
          </p>
          <div className="border-t border-gray-800 pt-4">
            <button onClick={deleteVenue}
              className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors">
              Delete venue permanently
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inp = 'w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}
