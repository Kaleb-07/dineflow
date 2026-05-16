import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import api from '../lib/axios';

const AMENITY_ICONS = [
  { label: 'WiFi',        value: 'wifi'        },
  { label: 'Parking',     value: 'car'         },
  { label: 'AC',          value: 'wind'        },
  { label: 'Pool',        value: 'waves'       },
  { label: 'Restaurant',  value: 'utensils'    },
  { label: 'Bar',         value: 'glass-water' },
  { label: 'Gym',         value: 'dumbbell'    },
  { label: 'Spa',         value: 'sparkles'    },
  { label: 'Lounge',      value: 'sofa'        },
  { label: 'Fine Dining', value: 'chef-hat'    },
  { label: 'Rooftop',     value: 'building-2'  },
  { label: 'Pet Friendly',value: 'paw-print'   },
];

const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_LABELS: Record<string,string> = {
  mon:'Monday', tue:'Tuesday', wed:'Wednesday',
  thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday'
};

export default function VenuePage() {
  const [tab, setTab] = useState<'info' | 'hours' | 'amenities' | 'social'>('info');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [amenities, setAmenities] = useState<{ id?: number; name: string; icon: string }[]>([]);

  const [info, setInfo] = useState({
    name: '', tagline: '', description: '',
    phone: '', email: '', address: '', city: '', country: '',
    logo: '', coverPhoto: '',
  });

  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>(
    Object.fromEntries(DAYS.map(d => [d, { open: '08:00', close: '22:00', closed: false }]))
  );

  const [social, setSocial] = useState({
    facebook: '', instagram: '', twitter: '', tiktok: '', website: ''
  });

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      if (!data) return;
      setInfo({
        name:        data.name        || '',
        tagline:     data.tagline     || '',
        description: data.description || '',
        phone:       data.phone       || '',
        email:       data.email       || '',
        address:     data.address     || '',
        city:        data.city        || '',
        country:     data.country     || '',
        logo:        data.logo        || '',
        coverPhoto:  data.coverPhoto  || '',
      });
      setSocial({
        facebook:  data.facebook  || '',
        instagram: data.instagram || '',
        twitter:   data.twitter   || '',
        tiktok:    data.tiktok    || '',
        website:   data.website   || '',
      });
      if (data.businessHours) setHours(data.businessHours);
      if (data.amenities)     setAmenities(data.amenities);
    });
  }, []);

  const uploadImg = async (e: React.ChangeEvent<HTMLInputElement>, key: 'logo' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    const { data } = await api.post('/upload', fd);
    setInfo(p => ({ ...p, [key]: data.url }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/settings', {
        ...info, ...social,
        businessHours: hours,
      });
      // Save amenities
      await api.post('/amenities/sync', amenities);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const addAmenity = () => setAmenities(p => [...p, { name: '', icon: 'wifi' }]);
  const removeAmenity = (i: number) => setAmenities(p => p.filter((_, j) => j !== i));

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Venue</h1>
          <p className="text-gray-400 text-sm mt-0.5">Hotel / restaurant profile</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 text-sm font-semibold rounded-lg transition-colors">
          <Save size={15} />
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save all'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-lg p-1 overflow-x-auto">
        {(['info','hours','amenities','social'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm capitalize whitespace-nowrap transition-colors flex-shrink-0 ${
              tab === t ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'
            }`}>
            {t === 'info' ? 'Basic info' : t === 'hours' ? 'Business hours' : t}
          </button>
        ))}
      </div>

      {/* ── Basic info ── */}
      {tab === 'info' && (
        <div className="space-y-4">
          {/* Cover photo */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="h-32 bg-gray-800 relative">
              {info.coverPhoto && (
                <img src={info.coverPhoto} className="w-full h-full object-cover" alt="" />
              )}
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors">
                <span className="text-white/70 text-sm bg-black/40 px-3 py-1.5 rounded-lg">
                  Upload cover photo
                </span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => uploadImg(e, 'coverPhoto')} />
              </label>
            </div>
            <div className="px-4 pb-4 pt-2 flex items-end gap-4 -mt-8">
              <div className="w-16 h-16 rounded-xl bg-gray-700 border-2 border-gray-900 relative overflow-hidden flex-shrink-0">
                {info.logo
                  ? <img src={info.logo} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">Logo</div>
                }
                <label className="absolute inset-0 cursor-pointer hover:bg-black/40 transition-colors flex items-center justify-center">
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => uploadImg(e, 'logo')} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Venue name" span={2}>
              <input className={inp} value={info.name}
                onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Tagline" span={2}>
              <input className={inp} value={info.tagline} placeholder="e.g. Fine Dining · Addis Ababa"
                onChange={e => setInfo(p => ({ ...p, tagline: e.target.value }))} />
            </Field>
            <Field label="About us" span={2}>
              <textarea className={`${inp} h-24 resize-none`} value={info.description}
                placeholder="Tell guests about your venue…"
                onChange={e => setInfo(p => ({ ...p, description: e.target.value }))} />
            </Field>
            <Field label="Phone">
              <input className={inp} value={info.phone} placeholder="+251 911 234 567"
                onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input className={inp} value={info.email} placeholder="info@venue.com"
                onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} />
            </Field>
            <Field label="Address" span={2}>
              <input className={inp} value={info.address} placeholder="123 Culinary Avenue"
                onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} />
            </Field>
            <Field label="City">
              <input className={inp} value={info.city} placeholder="Addis Ababa"
                onChange={e => setInfo(p => ({ ...p, city: e.target.value }))} />
            </Field>
            <Field label="Country">
              <input className={inp} value={info.country} placeholder="Ethiopia"
                onChange={e => setInfo(p => ({ ...p, country: e.target.value }))} />
            </Field>
          </div>
        </div>
      )}

      {/* ── Business hours ── */}
      {tab === 'hours' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3 px-4 py-3">
              <div className="w-24 flex-shrink-0">
                <span className="text-sm text-gray-300">{DAY_LABELS[day]}</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mr-2">
                <div onClick={() => setHours(p => ({
                  ...p, [day]: { ...p[day], closed: !p[day].closed }
                }))}
                  className={`w-8 h-4 rounded-full relative transition-colors ${
                    hours[day]?.closed ? 'bg-gray-700' : 'bg-amber-500'
                  }`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                    hours[day]?.closed ? 'translate-x-0.5' : 'translate-x-4'
                  }`} />
                </div>
                <span className="text-xs text-gray-500">
                  {hours[day]?.closed ? 'Closed' : 'Open'}
                </span>
              </label>
              {!hours[day]?.closed && (
                <div className="flex items-center gap-2 flex-1">
                  <input type="time" value={hours[day]?.open || '08:00'}
                    onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], open: e.target.value } }))}
                    className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-amber-500" />
                  <span className="text-gray-600 text-xs">to</span>
                  <input type="time" value={hours[day]?.close || '22:00'}
                    onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], close: e.target.value } }))}
                    className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-amber-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Amenities ── */}
      {tab === 'amenities' && (
        <div className="space-y-3">
          {amenities.map((a, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <select
                value={a.icon}
                onChange={e => setAmenities(p => p.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-2 py-1.5 outline-none">
                {AMENITY_ICONS.map(ic => (
                  <option key={ic.value} value={ic.value}>{ic.label}</option>
                ))}
              </select>
              <input
                className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
                placeholder="Amenity name e.g. Free WiFi"
                value={a.name}
                onChange={e => setAmenities(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
              />
              <button onClick={() => removeAmenity(i)}
                className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button onClick={addAmenity}
            className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm transition-colors">
            <Plus size={15} /> Add amenity
          </button>
        </div>
      )}

      {/* ── Social links ── */}
      {tab === 'social' && (
        <div className="space-y-4">
          {[
            { label: 'Facebook',  key: 'facebook',  placeholder: 'https://facebook.com/yourpage'  },
            { label: 'Instagram', key: 'instagram', placeholder: 'https://instagram.com/yourpage' },
            { label: 'Twitter/X', key: 'twitter',   placeholder: 'https://twitter.com/yourpage'   },
            { label: 'TikTok',    key: 'tiktok',    placeholder: 'https://tiktok.com/@yourpage'   },
            { label: 'Website',   key: 'website',   placeholder: 'https://yourwebsite.com'        },
          ].map(({ label, key, placeholder }) => (
            <Field key={key} label={label}>
              <input className={inp} value={(social as any)[key]} placeholder={placeholder}
                onChange={e => setSocial(p => ({ ...p, [key]: e.target.value }))} />
            </Field>
          ))}
        </div>
      )}
    </div>
  );
}

const inp = 'w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500 transition-colors';

function Field({ label, children, span }: {
  label: string; children: React.ReactNode; span?: number
}) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : ''}>
      <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}
