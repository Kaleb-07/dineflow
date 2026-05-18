import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { applyTheme } from '../hooks/useTheme';
import api from '../lib/axios';
import type { Theme } from '../types';

const PRESETS: Record<string, Partial<Theme>> = {
  'Luxury dark':   { bgColor: '#0d1f1a', accentColor: '#c9a84c', cardColor: '#122219', textColor: '#e8e0d0' },
  'Bistro warm':   { bgColor: '#1a1008', accentColor: '#e87c3e', cardColor: '#251808', textColor: '#f0e8d8' },
  'Ocean fresh':   { bgColor: '#061828', accentColor: '#3eb8a0', cardColor: '#0a2236', textColor: '#d8f0ee' },
  'Minimal light': { bgColor: '#f8f5ef', accentColor: '#2d2416', cardColor: '#ffffff', textColor: '#1a1510' },
  'Bold red':      { bgColor: '#1a0808', accentColor: '#e84c4c', cardColor: '#240a0a', textColor: '#f5e8e8' },
};

const FONTS = [
  { label: 'Cormorant Garamond — Luxury serif', value: "'Cormorant Garamond', serif" },
  { label: 'Playfair Display — Editorial',       value: "'Playfair Display', serif"   },
  { label: 'DM Sans — Modern clean',             value: "'DM Sans', sans-serif"       },
  { label: 'Outfit — Friendly modern',           value: "'Outfit', sans-serif"        },
  { label: 'Plus Jakarta Sans — Premium',        value: "'Plus Jakarta Sans', sans-serif" },
];

export default function ThemePage() {
  const { venue, setTheme: setStoreTheme } = useStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [theme, setTheme] = useState<Partial<Theme>>({
    bgColor: '#0d1f1a', accentColor: '#c9a84c', cardColor: '#122219', textColor: '#e8e0d0',
    fontDisplay: "'Cormorant Garamond', serif", fontBody: "'DM Sans', sans-serif",
    borderRadius: 8, cardPadding: 8, itemGap: 6,
    showImages: true, showPrice: true, showMealTabs: true, showDesc: true,
  });
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [active,  setActive]  = useState('Luxury dark');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      if (data?.theme) { 
        setTheme(data.theme); 
        applyTheme(data.theme);
      }
    });
  }, []);

  // Apply theme to iframe whenever it changes
  useEffect(() => {
    const applyToIframe = () => {
      try {
        if (iframeRef.current?.contentWindow) {
          const iframeDoc = iframeRef.current.contentWindow.document;
          const root = iframeDoc.documentElement;
          
          root.style.setProperty('--brand-bg', theme.bgColor || '#0d1f1a');
          root.style.setProperty('--brand-accent', theme.accentColor || '#c9a84c');
          root.style.setProperty('--brand-card', theme.cardColor || '#122219');
          root.style.setProperty('--brand-text', theme.textColor || '#e8e0d0');
          root.style.setProperty('--brand-font-display', theme.fontDisplay || "'Cormorant Garamond', serif");
          root.style.setProperty('--brand-font-body', theme.fontBody || "'DM Sans', sans-serif");
          root.style.setProperty('--brand-radius', `${theme.borderRadius || 8}px`);
          root.style.setProperty('--brand-padding', `${theme.cardPadding || 8}px`);
          root.style.setProperty('--brand-gap', `${theme.itemGap || 6}px`);
          
          // Feature toggles
          root.dataset.showImages = String(theme.showImages ?? true);
          root.dataset.showPrice = String(theme.showPrice ?? true);
          root.dataset.showMealTabs = String(theme.showMealTabs ?? true);
          root.dataset.showDesc = String(theme.showDesc ?? true);
        }
      } catch (err) {
        // Cross-origin or not loaded yet
        console.log('Iframe not ready yet');
      }
    };

    // Try immediately
    applyToIframe();
    
    // Also try after a short delay in case iframe is still loading
    const timer = setTimeout(applyToIframe, 100);
    
    return () => clearTimeout(timer);
  }, [theme]);

  const update = (patch: Partial<Theme>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    applyTheme(next);
    setActive('');
  };

  const applyPreset = (name: string) => {
    const next = { ...theme, ...PRESETS[name] };
    setTheme(next);
    applyTheme(next);
    setActive(name);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/settings/theme', theme);
      setStoreTheme(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* ── Left: Controls (scrollable) ── */}
      <div className="w-[420px] flex-shrink-0 overflow-y-auto pr-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Branding</h1>
            <p className="text-gray-400 text-sm mt-0.5">Customize how your menu looks for guests</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Presets */}
          <Section title="Quick presets">
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map(name => (
                <button key={name} onClick={() => applyPreset(name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    active === name
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                  }`}>
                  {name}
                </button>
              ))}
            </div>
          </Section>

          {/* Colors */}
          <Section title="Colors">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Background',      key: 'bgColor'      },
                { label: 'Accent / brand',  key: 'accentColor'  },
                { label: 'Card background', key: 'cardColor'    },
                { label: 'Text color',      key: 'textColor'    },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">
                      {(theme as any)[key]}
                    </span>
                    <input type="color"
                      value={(theme as any)[key] || '#000000'}
                      onChange={e => update({ [key]: e.target.value } as any)}
                      className="w-8 h-8 rounded-lg border border-gray-700 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography">
            {[
              { label: 'Heading font', key: 'fontDisplay' },
              { label: 'Body font',    key: 'fontBody'    },
            ].map(({ label, key }) => (
              <div key={key} className="mb-3 last:mb-0">
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
                <select
                  value={(theme as any)[key]}
                  onChange={e => update({ [key]: e.target.value } as any)}
                  className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-amber-500">
                  {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            ))}
          </Section>

          {/* Shape & spacing */}
          <Section title="Shape & spacing">
            {[
              { label: 'Card corner radius', key: 'borderRadius', min: 0,  max: 24, unit: 'px' },
              { label: 'Card padding',       key: 'cardPadding',  min: 4,  max: 20, unit: 'px' },
              { label: 'Item gap',           key: 'itemGap',      min: 2,  max: 16, unit: 'px' },
            ].map(({ label, key, min, max, unit }) => (
              <div key={key} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
                  <span className="text-xs text-gray-500">{(theme as any)[key]}{unit}</span>
                </div>
                <input type="range" min={min} max={max}
                  value={(theme as any)[key] || 0}
                  onChange={e => update({ [key]: Number(e.target.value) } as any)}
                  className="w-full accent-amber-500"
                />
              </div>
            ))}
          </Section>

          {/* Feature toggles */}
          <Section title="Show / hide features">
            {[
              { label: 'Item images',      key: 'showImages'   },
              { label: 'Prices',           key: 'showPrice'    },
              { label: 'Meal-time tabs',   key: 'showMealTabs' },
              { label: 'Descriptions',     key: 'showDesc'     },
            ].map(({ label, key }) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <span className="text-sm text-gray-300">{label}</span>
                <div
                  onClick={() => update({ [key]: !(theme as any)[key] } as any)}
                  className={`w-10 h-5 rounded-full cursor-pointer relative transition-colors ${
                    (theme as any)[key] ? 'bg-amber-500' : 'bg-gray-700'
                  }`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    (theme as any)[key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>
            ))}
          </Section>

          {/* Save button */}
          <button onClick={save} disabled={saving}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-900 text-sm font-semibold rounded-lg transition-colors">
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save & publish'}
          </button>

          {/* Preview link */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Preview as guest</span>
            <a href={`/menu/${venue?.slug}`} target="_blank" rel="noreferrer"
              className="text-amber-400 text-sm hover:text-amber-300">
              Open menu ↗
            </a>
          </div>
        </div>
      </div>

      {/* ── Right: Live Preview (fixed, non-scrolling) ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-3 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Live Preview</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Changes apply instantly</span>
            {/* View mode toggle */}
            <div className="flex items-center gap-0.5 bg-gray-800 rounded-md p-0.5 border border-gray-700">
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-amber-500 text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}>
                📱
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-amber-500 text-gray-900'
                    : 'text-gray-400 hover:text-white'
                }`}>
                🖥
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center p-8">
            {viewMode === 'mobile' ? (
              /* Mobile view - Phone frame (scaled down) */
              <div className="w-[280px] h-[560px] bg-gray-950 rounded-[2rem] shadow-2xl overflow-hidden border-[10px] border-gray-900 relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-900 rounded-b-lg z-10" />
                <iframe
                  ref={iframeRef}
                  src={`/menu/${venue?.slug}`}
                  className="w-full h-full"
                  style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.33%', height: '133.33%' }}
                  title="Guest Menu Preview"
                  onLoad={() => {
                    setTimeout(() => {
                      try {
                        if (iframeRef.current?.contentWindow) {
                          const iframeDoc = iframeRef.current.contentWindow.document;
                          const root = iframeDoc.documentElement;
                          
                          root.style.setProperty('--brand-bg', theme.bgColor || '#0d1f1a');
                          root.style.setProperty('--brand-accent', theme.accentColor || '#c9a84c');
                          root.style.setProperty('--brand-card', theme.cardColor || '#122219');
                          root.style.setProperty('--brand-text', theme.textColor || '#e8e0d0');
                          root.style.setProperty('--brand-font-display', theme.fontDisplay || "'Cormorant Garamond', serif");
                          root.style.setProperty('--brand-font-body', theme.fontBody || "'DM Sans', sans-serif");
                          root.style.setProperty('--brand-radius', `${theme.borderRadius || 8}px`);
                          root.style.setProperty('--brand-padding', `${theme.cardPadding || 8}px`);
                          root.style.setProperty('--brand-gap', `${theme.itemGap || 6}px`);
                          
                          root.dataset.showImages = String(theme.showImages ?? true);
                          root.dataset.showPrice = String(theme.showPrice ?? true);
                          root.dataset.showMealTabs = String(theme.showMealTabs ?? true);
                          root.dataset.showDesc = String(theme.showDesc ?? true);
                        }
                      } catch (err) {
                        console.log('Cannot access iframe:', err);
                      }
                    }, 50);
                  }}
                />
              </div>
            ) : (
              /* Desktop view - Larger browser frame */
              <div className="w-[800px] h-[600px] bg-gray-950 rounded-lg shadow-2xl overflow-hidden border-2 border-gray-800 flex flex-col">
                {/* Browser chrome */}
                <div className="h-8 bg-gray-900 border-b border-gray-800 flex items-center px-3 gap-2 flex-shrink-0">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="bg-gray-800 rounded px-3 py-1 text-[10px] text-gray-500 font-mono">
                      {venue?.slug}.dineflow.app
                    </div>
                  </div>
                </div>
                {/* Desktop iframe */}
                <iframe
                  ref={iframeRef}
                  src={`/menu/${venue?.slug}`}
                  className="w-full flex-1"
                  title="Guest Menu Preview"
                  onLoad={() => {
                    setTimeout(() => {
                      try {
                        if (iframeRef.current?.contentWindow) {
                          const iframeDoc = iframeRef.current.contentWindow.document;
                          const root = iframeDoc.documentElement;
                          
                          root.style.setProperty('--brand-bg', theme.bgColor || '#0d1f1a');
                          root.style.setProperty('--brand-accent', theme.accentColor || '#c9a84c');
                          root.style.setProperty('--brand-card', theme.cardColor || '#122219');
                          root.style.setProperty('--brand-text', theme.textColor || '#e8e0d0');
                          root.style.setProperty('--brand-font-display', theme.fontDisplay || "'Cormorant Garamond', serif");
                          root.style.setProperty('--brand-font-body', theme.fontBody || "'DM Sans', sans-serif");
                          root.style.setProperty('--brand-radius', `${theme.borderRadius || 8}px`);
                          root.style.setProperty('--brand-padding', `${theme.cardPadding || 8}px`);
                          root.style.setProperty('--brand-gap', `${theme.itemGap || 6}px`);
                          
                          root.dataset.showImages = String(theme.showImages ?? true);
                          root.dataset.showPrice = String(theme.showPrice ?? true);
                          root.dataset.showMealTabs = String(theme.showMealTabs ?? true);
                          root.dataset.showDesc = String(theme.showDesc ?? true);
                        }
                      } catch (err) {
                        console.log('Cannot access iframe:', err);
                      }
                    }, 50);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}
