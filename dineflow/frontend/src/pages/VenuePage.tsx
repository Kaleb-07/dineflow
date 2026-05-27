import { useEffect, useState } from 'react';
import {
  Save, Globe, Clock, Sparkles,
  Upload, CheckCircle, Building2, Loader2
} from 'lucide-react';
import api from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

// ── Constants ──────────────────────────────────────────
const AMENITY_ICONS = [
  { label: 'WiFi',         value: 'wifi'         },
  { label: 'Parking',      value: 'car'          },
  { label: 'AC',           value: 'wind'         },
  { label: 'Pool',         value: 'waves'        },
  { label: 'Restaurant',   value: 'utensils'     },
  { label: 'Bar',          value: 'glass-water'  },
  { label: 'Gym',          value: 'dumbbell'     },
  { label: 'Spa',          value: 'sparkles'     },
  { label: 'Lounge',       value: 'sofa'         },
  { label: 'Fine Dining',  value: 'chef-hat'     },
  { label: 'Rooftop',      value: 'building-2'   },
  { label: 'Pet Friendly', value: 'paw-print'    },
  { label: 'Valet',        value: 'key'          },
  { label: 'Delivery',     value: 'bike'         },
  { label: 'Takeout',      value: 'package'      },
];

const AMENITY_EMOJI: Record<string, string> = {
  wifi: '📶', car: '🚗', wind: '❄️', waves: '🏊', utensils: '🍽️',
  'glass-water': '🍸', dumbbell: '💪', sparkles: '✨', sofa: '🛋️',
  'chef-hat': '👨‍🍳', 'building-2': '🏙️', 'paw-print': '🐾',
  key: '🔑', bike: '🚴', package: '📦',
};

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};

type Tab = 'info' | 'hours' | 'amenities' | 'social';

interface HoursEntry { open: string; close: string; closed: boolean }
interface Amenity { id?: number; name: string; icon: string }

// ── Main Component ─────────────────────────────────────
export default function VenuePage() {
  const [tab, setTab] = useState<Tab>('info');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  const [info, setInfo] = useState({
    name: '', tagline: '', description: '',
    phone: '', email: '', address: '', city: '', country: '',
    logo: '', coverPhoto: '',
  });

  const [hours, setHours] = useState<Record<string, HoursEntry>>(
    Object.fromEntries(DAYS.map(d => [d, { open: '08:00', close: '22:00', closed: false }]))
  );

  const [social, setSocial] = useState({
    facebook: '', instagram: '', twitter: '', tiktok: '', website: '',
  });

  // ── Load ────────────────────────────────────────────
  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      if (!data) return;
      setInfo({
        name:        data.name        ?? '',
        tagline:     data.tagline     ?? '',
        description: data.description ?? '',
        phone:       data.phone       ?? '',
        email:       data.email       ?? '',
        address:     data.address     ?? '',
        city:        data.city        ?? '',
        country:     data.country     ?? '',
        logo:        data.logo        ?? '',
        coverPhoto:  data.coverPhoto  ?? '',
      });
      setSocial({
        facebook:  data.facebook  ?? '',
        instagram: data.instagram ?? '',
        twitter:   data.twitter   ?? '',
        tiktok:    data.tiktok    ?? '',
        website:   data.website   ?? '',
      });
      if (data.businessHours) setHours(data.businessHours);
      if (data.amenities)     setAmenities(data.amenities);
    });
  }, []);

  // ── Image Upload ────────────────────────────────────
  const uploadImg = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'logo' | 'coverPhoto'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (key === 'logo') setUploadingLogo(true);
    else setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload', fd);
      setInfo(p => ({ ...p, [key]: data.url }));
    } finally {
      if (key === 'logo') setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  // ── Save ────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/settings', { ...info, ...social, businessHours: hours });
      await api.post('/amenities/sync', amenities);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  // ── Amenity helpers ─────────────────────────────────
  const addAmenity = () => setAmenities(p => [...p, { name: '', icon: 'wifi' }]);
  const removeAmenity = (i: number) => setAmenities(p => p.filter((_, j) => j !== i));
  const updateAmenity = (i: number, patch: Partial<Amenity>) =>
    setAmenities(p => p.map((a, j) => j === i ? { ...a, ...patch } : a));

  // ── Render ─────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'info',      label: 'Basic Info',      icon: <Building2 size={15} /> },
    { id: 'hours',     label: 'Hours',           icon: <Clock size={15} />     },
    { id: 'amenities', label: 'Amenities',       icon: <Sparkles size={15} />  },
    { id: 'social',    label: 'Social & Links',  icon: <Globe size={15} />     },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Venue Profile</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            This information appears in your guest-facing menu
          </p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : saved ? (
            <CheckCircle size={15} className="text-green-400" />
          ) : (
            <Save size={15} />
          )}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save all'}
        </Button>
      </div>

      {/* ── Tab Strip ── */}
      <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1">
        {tabs.map(t => (
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
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Basic Info ── */}
      {tab === 'info' && (
        <div className="space-y-5">

          {/* Cover + Logo card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Cover photo area */}
            <div className="relative h-36 bg-gray-800 group">
              {info.coverPhoto && (
                <img src={info.coverPhoto} className="w-full h-full object-cover" alt="" />
              )}
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer transition-all bg-black/0 hover:bg-black/40">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-white text-xs bg-black/60 px-3 py-1.5 rounded-lg">
                  {uploadingCover ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploadingCover ? 'Uploading…' : 'Upload cover photo'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={e => uploadImg(e, 'coverPhoto')} />
              </label>
            </div>

            {/* Logo overlapping cover */}
            <div className="px-5 pb-4 flex items-end gap-4 -mt-7">
              <div className="relative w-14 h-14 rounded-xl bg-gray-700 border-2 border-gray-900 overflow-hidden flex-shrink-0 group">
                {info.logo
                  ? <img src={info.logo} className="w-full h-full object-cover" alt="Logo" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Logo</div>
                }
                <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/50 transition-all">
                  {uploadingLogo
                    ? <Loader2 size={13} className="text-white animate-spin" />
                    : <Upload size={13} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={e => uploadImg(e, 'logo')} />
                </label>
              </div>
              <div className="pb-1">
                <div className="text-white font-medium text-sm">{info.name || 'Your venue name'}</div>
                <div className="text-gray-500 text-xs">{info.tagline || 'Tagline…'}</div>
              </div>
            </div>
          </div>

          {/* Venue details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Venue name" span={2}>
              <Input value={info.name} placeholder="e.g. Lalibela Restaurant"
                onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Tagline" span={2}>
              <Input value={info.tagline} placeholder="e.g. Fine Dining · Addis Ababa"
                onChange={e => setInfo(p => ({ ...p, tagline: e.target.value }))} />
            </Field>
            <Field label="About us" span={2}>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-colors h-24 resize-none"
                placeholder="Tell guests about your venue, atmosphere, and specialties…"
                value={info.description}
                onChange={e => setInfo(p => ({ ...p, description: e.target.value }))}
              />
            </Field>
            <Field label="Phone">
              <Input value={info.phone} placeholder="+251 911 234 567"
                onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} />
            </Field>
            <Field label="Email">
              <Input value={info.email} placeholder="info@venue.com"
                onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} />
            </Field>
            <Field label="Address" span={2}>
              <Input value={info.address} placeholder="123 Culinary Avenue"
                onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} />
            </Field>
            <Field label="City">
              <Input value={info.city} placeholder="Addis Ababa"
                onChange={e => setInfo(p => ({ ...p, city: e.target.value }))} />
            </Field>
            <Field label="Country">
              <Input value={info.country} placeholder="Ethiopia"
                onChange={e => setInfo(p => ({ ...p, country: e.target.value }))} />
            </Field>
          </div>
        </div>
      )}

      {/* ── Business Hours ── */}
      {tab === 'hours' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800 overflow-hidden">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3 px-5 py-3.5">
              {/* Day label */}
              <div className="w-24 flex-shrink-0">
                <span className="text-sm text-gray-300 font-medium">{DAY_LABELS[day]}</span>
              </div>

              {/* Toggle */}
              <button
                onClick={() => setHours(p => ({
                  ...p, [day]: { ...p[day], closed: !p[day].closed }
                }))}
                className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${
                  hours[day]?.closed ? 'bg-gray-700' : 'bg-amber-500'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  hours[day]?.closed ? 'translate-x-0.5' : 'translate-x-4'
                }`} />
              </button>

              {/* Status / times */}
              {hours[day]?.closed ? (
                <span className="text-xs text-gray-600 italic">Closed</span>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={hours[day]?.open || '08:00'}
                    onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], open: e.target.value } }))}
                    className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500"
                  />
                  <span className="text-gray-600 text-xs">to</span>
                  <input
                    type="time"
                    value={hours[day]?.close || '22:00'}
                    onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], close: e.target.value } }))}
                    className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Amenities ── */}
      {tab === 'amenities' && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 mb-2">
            Amenities appear in your guest menu's "About" tab.
          </p>
          {amenities.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              {/* Emoji preview */}
              <span className="text-xl w-7 text-center flex-shrink-0">
                {AMENITY_EMOJI[a.icon] || '✨'}
              </span>

              {/* Icon picker */}
              <select
                value={a.icon}
                onChange={e => updateAmenity(i, { icon: e.target.value })}
                className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-amber-500"
              >
                {AMENITY_ICONS.map(ic => (
                  <option key={ic.value} value={ic.value}>{ic.label}</option>
                ))}
              </select>

              {/* Name */}
              <Input
                className="flex-1"
                placeholder="Amenity name e.g. Free WiFi"
                value={a.name}
                onChange={e => updateAmenity(i, { name: e.target.value })}
              />

              {/* Remove */}
              <button
                onClick={() => removeAmenity(i)}
                className="text-gray-600 hover:text-red-400 transition-colors p-1"
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={addAmenity}
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm transition-colors py-1"
          >
            + Add amenity
          </button>
        </div>
      )}

      {/* ── Social & Links ── */}
      {tab === 'social' && (
        <div className="space-y-4">
          {[
            { label: 'Facebook',   key: 'facebook',  icon: '📘', placeholder: 'https://facebook.com/yourpage'  },
            { label: 'Instagram',  key: 'instagram', icon: '📸', placeholder: 'https://instagram.com/yourpage' },
            { label: 'Twitter/X',  key: 'twitter',   icon: '🐦', placeholder: 'https://twitter.com/yourpage'   },
            { label: 'TikTok',     key: 'tiktok',    icon: '🎵', placeholder: 'https://tiktok.com/@yourpage'   },
            { label: 'Website',    key: 'website',   icon: '🌐', placeholder: 'https://yourwebsite.com'        },
          ].map(({ label, key, icon, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="text-sm">{icon}</span>{label}
              </label>
              <Input
                value={(social as any)[key]}
                placeholder={placeholder}
                onChange={e => setSocial(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}

          {/* Preview card */}
          {(social.facebook || social.instagram || social.twitter || social.tiktok || social.website) && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-2">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Preview in guest menu</div>
              <div className="flex flex-wrap gap-2">
                {social.facebook  && <SocialBadge icon="📘" label="Facebook"  />}
                {social.instagram && <SocialBadge icon="📸" label="Instagram" />}
                {social.twitter   && <SocialBadge icon="🐦" label="Twitter"   />}
                {social.tiktok    && <SocialBadge icon="🎵" label="TikTok"    />}
                {social.website   && <SocialBadge icon="🌐" label="Website"   />}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom Save bar (visible on all tabs) ── */}
      <div className="mt-8 flex items-center justify-between py-4 border-t border-gray-800">
        <p className="text-xs text-gray-600">Changes appear live in your guest menu after saving.</p>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}

// ── Small helper components ────────────────────────────
function Field({
  label, children, span,
}: { label: string; children: React.ReactNode; span?: 1 | 2 }) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : ''}>
      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function SocialBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-300 border border-gray-700 bg-gray-800 px-2.5 py-1 rounded-full">
      <span className="text-amber-400">{icon}</span>{label}
    </span>
  );
}
