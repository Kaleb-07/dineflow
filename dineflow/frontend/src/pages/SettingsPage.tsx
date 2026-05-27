import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Copy, Check, ExternalLink, User, Building2, AlertTriangle, Loader2, Key
} from 'lucide-react';
import api from '../lib/axios';
import { Button, buttonVariants } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function SettingsPage() {
  const { user, venue, clearAuth, setUser, setVenue } = useStore();
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
      if (user) {
        setUser({ ...user, name, email });
      }
      setSaved(true);
      setPassword('');
      setNewPass('');
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save account settings');
    } finally {
      setSaving(false);
    }
  };

  const saveVenue = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch('/settings', { currency, language });
      setVenue(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError('Failed to save venue settings');
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/menu/${venue?.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  const deleteVenue = async () => {
    const confirm1 = window.confirm(
      'Are you sure? This will permanently delete all your menu items, QR codes, and reviews.'
    );
    if (!confirm1) return;
    const typed = window.prompt(`Type your venue name "${venue?.name}" to confirm:`);
    if (typed !== venue?.name) return alert('Name did not match. Cancelled.');
    try {
      await api.delete('/settings/venue');
      clearAuth();
      navigate('/login');
    } catch (err) {
      alert('Failed to delete venue');
    }
  };

  const selectStyle = "flex h-10 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[size:16px] bg-[position:right_12px_center] bg-no-repeat pr-10";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your personal profile and restaurant options</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
        {[
          { id: 'account' as const, label: 'Account Profile', icon: <User size={15} /> },
          { id: 'venue' as const,   label: 'Venue Config',    icon: <Building2 size={15} /> },
          { id: 'danger' as const,  label: 'Danger Zone',     icon: <AlertTriangle size={15} className="text-red-400" /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Account tab ── */}
      {tab === 'account' && (
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Display Name">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" />
              </Field>
              <Field label="Email Address">
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@restaurant.com" />
              </Field>
            </div>

            {/* Change password sub-card */}
            <div className="border-t border-gray-800 pt-5 mt-2 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Key size={14} className="text-amber-500" />
                  Change Password
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Leave blank if you do not wish to modify your password</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Current Password">
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                </Field>
                <Field label="New Password">
                  <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimum 6 characters" />
                </Field>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-gray-800">
              <Button onClick={saveAccount} disabled={saving} className="w-full sm:w-auto px-6 font-semibold">
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : saved ? (
                  <Check size={15} className="text-green-400" />
                ) : null}
                {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Profile'}
              </Button>
              <Button onClick={logout} variant="ghost" className="w-full sm:w-auto text-gray-500 hover:text-red-400 hover:bg-red-500/10 gap-2">
                <LogOut size={15} /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Venue settings tab ── */}
      {tab === 'venue' && (
        <div className="space-y-4">
          {/* Menu Link Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Guest Menu Link</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              This is the direct, live URL where guests can view your menu. Share this link online or link it to custom QR codes.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-950 border border-gray-800 rounded-xl p-2">
              <code className="text-amber-400 text-xs font-mono select-all truncate px-2 py-1.5 flex-1 min-w-0">
                {window.location.origin}/menu/{venue?.slug}
              </code>
              <div className="flex gap-1.5 flex-shrink-0">
                <Button variant="secondary" size="sm" onClick={copyLink} className="flex-1 sm:flex-none gap-1.5 text-xs">
                  {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <a
                  href={`/menu/${venue?.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`${buttonVariants({ variant: 'outline', size: 'sm' })} flex-1 sm:flex-none gap-1.5 text-xs`}
                >
                  <ExternalLink size={13} />
                  Open Menu
                </a>
              </div>
            </div>
          </div>

          {/* Regional Settings Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Regional Configurations</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Display Currency">
                <select className={selectStyle} value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="ETB">Birr (ETB)</option>
                  <option value="USD">Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">Pound (GBP)</option>
                  <option value="KES">Shilling (KES)</option>
                  <option value="UGX">Shilling (UGX)</option>
                  <option value="TZS">Shilling (TZS)</option>
                  <option value="ZAR">Rand (ZAR)</option>
                  <option value="NGN">Naira (NGN)</option>
                  <option value="SAR">Riyal (SAR)</option>
                  <option value="AED">Dirham (AED)</option>
                </select>
              </Field>
              <Field label="System Language">
                <select className={selectStyle} value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="en">English (US)</option>
                  <option value="am">Amharic (አማርኛ)</option>
                  <option value="ar">Arabic (العربية)</option>
                  <option value="fr">French (Français)</option>
                  <option value="sw">Swahili (Kiswahili)</option>
                </select>
              </Field>
            </div>

            <div className="pt-3 border-t border-gray-800">
              <Button onClick={saveVenue} disabled={saving} className="w-full sm:w-auto px-6 font-semibold">
                {saving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : saved ? (
                  <Check size={15} className="text-green-400" />
                ) : null}
                {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Venue Settings'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Danger Zone Tab ── */}
      {tab === 'danger' && (
        <div className="bg-red-950/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-400 font-semibold">
            <AlertTriangle size={18} />
            <span>Danger Zone</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Deleting your venue is **permanent** and cannot be reversed. This action immediately deletes all of your menu categories, items, custom QR codes, guest reviews, and page theme profiles.
          </p>
          <div className="pt-4 border-t border-red-500/10">
            <Button onClick={deleteVenue} variant="destructive" className="w-full py-2.5 font-semibold">
              Delete Venue Permanently
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</label>
      {children}
    </div>
  );
}
