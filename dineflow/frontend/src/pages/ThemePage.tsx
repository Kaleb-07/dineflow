import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { applyTheme } from '../hooks/useTheme';
import api from '../lib/axios';
import type { Theme } from '../types';
import HoverSection from '../components/features/HoverSection';
import AnimationsSection from '../components/features/AnimationsSection';
import { useToast } from '../components/Toast';

const PRESETS: Record<string, Partial<Theme>> = {
  'Luxury dark':   { bgColor: '#0d1f1a', accentColor: '#c9a84c', cardColor: '#122219', textColor: '#e8e0d0' },
  'Bistro warm':   { bgColor: '#1a1008', accentColor: '#e87c3e', cardColor: '#251808', textColor: '#f0e8d8' },
  'Ocean fresh':   { bgColor: '#061828', accentColor: '#3eb8a0', cardColor: '#0a2236', textColor: '#d8f0ee' },
  'Minimal light': { bgColor: '#f8f5ef', accentColor: '#2d2416', cardColor: '#ffffff', textColor: '#1a1510' },
  'Bold red':      { bgColor: '#1a0808', accentColor: '#e84c4c', cardColor: '#240a0a', textColor: '#f5e8e8' },
};

const GOOGLE_FONTS = [
  // The Serif
  { name: 'Playfair Display', category: 'Serif', value: "'Playfair Display', serif" },
  { name: 'Cormorant Garamond', category: 'Serif', value: "'Cormorant Garamond', serif" },
  { name: 'Lora', category: 'Serif', value: "'Lora', serif" },
  { name: 'Merriweather', category: 'Serif', value: "'Merriweather', serif" },
  { name: 'Crimson Text', category: 'Serif', value: "'Crimson Text', serif" },
  { name: 'EB Garamond', category: 'Serif', value: "'EB Garamond', serif" },
  
  // Sans-serif
  { name: 'DM Sans', category: 'Sans-serif', value: "'DM Sans', sans-serif" },
  { name: 'Manrope', category: 'Sans-serif', value: "'Manrope', sans-serif" },
  { name: 'Inter', category: 'Sans-serif', value: "'Inter', sans-serif" },
  { name: 'Outfit', category: 'Sans-serif', value: "'Outfit', sans-serif" },
  { name: 'Plus Jakarta Sans', category: 'Sans-serif', value: "'Plus Jakarta Sans', sans-serif" },
  { name: 'Work Sans', category: 'Sans-serif', value: "'Work Sans', sans-serif" },
  { name: 'Poppins', category: 'Sans-serif', value: "'Poppins', sans-serif" },
  
  // Display
  { name: 'Bebas Neue', category: 'Display', value: "'Bebas Neue', sans-serif" },
  { name: 'Righteous', category: 'Display', value: "'Righteous', sans-serif" },
  { name: 'Oswald', category: 'Display', value: "'Oswald', sans-serif" },
  
  // Handwriting
  { name: 'Dancing Script', category: 'Handwriting', value: "'Dancing Script', cursive" },
  { name: 'Pacifico', category: 'Handwriting', value: "'Pacifico', cursive" },
];

export default function ThemePage() {
  const toast = useToast();
  const { venue, setTheme: setStoreTheme } = useStore();
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const desktopIframeRef = useRef<HTMLIFrameElement>(null);
  
  const [theme, setTheme] = useState<Partial<Theme>>({
    bgColor: '#0d1f1a', accentColor: '#c9a84c', cardColor: '#122219', textColor: '#e8e0d0',
    fontDisplay: "'Cormorant Garamond', serif", fontBody: "'DM Sans', sans-serif",
    borderRadius: 8, cardPadding: 8, itemGap: 6,
    showImages: true, showPrice: true, showMealTabs: true, showDesc: true,
    cardStyle: 'default', menuLayout: 'list', categoryStyle: 'pills',
    drinkStyle: 'same', showAllergens: false, showBadges: true,
    imageShape: 'rounded', pricePosition: 'bottom', polygonVariant: 'hexagon',
    animateItems: false, animateHover: false, hoverStyle: 'lift', hoverSpeed: 5, animatePrice: false,
    animateCategories: false, animationSpeed: 5,
    // Page animation defaults — MUST be set so applyToIframe doesn't default to 'none'
    entranceStyle: 'none', priceFx: 'none', categoryFx: 'crossfade', animSpeed: 5,
    // Per-page visual style defaults
    aboutStyle: 'hero-story', reviewsStyle: 'spotlight', locationStyle: 'card-stack',
  });
  
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [active,  setActive]  = useState('Luxury dark');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [fontSearch, setFontSearch] = useState('');
  const [fontCategory, setFontCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'general' | 'menu' | 'about' | 'reviews' | 'location' | 'animations'>('general');

  // Derive active iframe ref based on current viewMode
  const iframeRef = viewMode === 'mobile' ? mobileIframeRef : desktopIframeRef;

  // Send a tab-switch message to whichever iframe is currently active
  const sendTabMessage = (tab: string) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'SET_PREVIEW_TAB', tab }, '*');
  };

  // Sync iframe preview with current visual editor category tab
  useEffect(() => {
    const targetTab =
      activeTab === 'about' ? 'about' :
      activeTab === 'reviews' ? 'reviews' :
      activeTab === 'location' ? 'location' : 'menu';

    // Send at increasing intervals to handle slow iframe loads
    const t1 = setTimeout(() => sendTabMessage(targetTab), 200);
    const t2 = setTimeout(() => sendTabMessage(targetTab), 800);
    const t3 = setTimeout(() => sendTabMessage(targetTab), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, viewMode]);

  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      if (data?.theme) { 
        setTheme(data.theme); 
        applyTheme(data.theme);
      }
    });
  }, []);

  // applyToIframe: forcefully inject theme into the preview iframe.
  // We use a ref so the interval can always read the latest theme value.
  const themeRef = useRef(theme);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  const applyToOneIframe = (iframeEl: HTMLIFrameElement | null) => {
    if (!iframeEl?.contentWindow) return;
    try {
      const iframeDoc = iframeEl.contentWindow.document;
      const root = iframeDoc.documentElement;
      const t = themeRef.current;

      root.style.setProperty('--brand-bg',           t.bgColor      ?? '#0d1f1a');
      root.style.setProperty('--brand-accent',        t.accentColor  ?? '#c9a84c');
      root.style.setProperty('--brand-card',          t.cardColor    ?? '#122219');
      root.style.setProperty('--brand-text',          t.textColor    ?? '#e8e0d0');
      root.style.setProperty('--brand-font-display',  t.fontDisplay  ?? "'Cormorant Garamond', serif");
      root.style.setProperty('--brand-font-body',     t.fontBody     ?? "'DM Sans', sans-serif");
      root.style.setProperty('--brand-radius',        `${t.borderRadius ?? 8}px`);
      root.style.setProperty('--brand-padding',       `${t.cardPadding  ?? 8}px`);
      root.style.setProperty('--brand-gap',           `${t.itemGap      ?? 6}px`);

      root.dataset.showImages    = String(t.showImages    ?? true);
      root.dataset.showPrice     = String(t.showPrice     ?? true);
      root.dataset.showMealTabs  = String(t.showMealTabs  ?? true);
      root.dataset.showDesc      = String(t.showDesc      ?? true);
      root.dataset.showAllergens = String(t.showAllergens ?? false);
      root.dataset.showBadges    = String(t.showBadges    ?? true);
      root.dataset.cardStyle     = t.cardStyle     ?? 'default';
      root.dataset.menuLayout    = t.menuLayout    ?? 'list';
      root.dataset.categoryStyle = t.categoryStyle ?? 'pills';
      root.dataset.polygonVariant= t.polygonVariant?? 'hexagon';
      root.dataset.imageShape    = t.imageShape    ?? 'rounded';
      root.dataset.pricePosition = t.pricePosition ?? 'bottom';

      // ── Hover animations ──────────────────────────────────────
      // Use ?? so a saved null from DB doesn't fall through to 'none'
      const hoverStyle = t.hoverStyle ?? (t.animateHover ? 'lift' : 'none');
      root.dataset.hoverStyle    = hoverStyle;
      root.dataset.animateHover  = String(hoverStyle !== 'none');
      const hoverSec = ((Number(t.hoverSpeed ?? 5) * 0.05) + 0.05).toFixed(2);
      root.style.setProperty('--hover-speed', `${hoverSec}s`);

      // ── Page animations (entrance / price / category) ─────────
      const animSec = ((Number(t.animSpeed ?? 5) * 0.05) + 0.05).toFixed(2);
      root.style.setProperty('--anim-speed', `${animSec}s`);
      const priceAnimSec = ((Number(t.animationSpeed ?? 5) * 0.05) + 0.05).toFixed(2);
      root.style.setProperty('--price-anim-speed', `${priceAnimSec}s`);

      // Use ?? — null from DB must NOT fall through to 'none'
      root.dataset.entrance   = t.entranceStyle ?? (t.animateItems      ? 'fade-up'   : 'none');
      root.dataset.priceFx    = t.priceFx       ?? (t.animatePrice     ? 'shimmer'   : 'none');
      root.dataset.categoryFx = t.categoryFx    ?? (t.animateCategories? 'crossfade' : 'none');

      // Per-page visual styles
      root.dataset.aboutStyle    = t.aboutStyle    || 'hero-story';
      root.dataset.reviewsStyle  = t.reviewsStyle  || 'spotlight';
      root.dataset.locationStyle = t.locationStyle || 'card-stack';
    } catch (_) {
      // Iframe not ready yet
    }
  };

  // Apply to both iframes so switching views is always up-to-date
  const applyToIframe = () => {
    applyToOneIframe(mobileIframeRef.current);
    applyToOneIframe(desktopIframeRef.current);
  };

  // Re-apply on every theme change
  useEffect(() => {
    applyToIframe();
    // Also re-apply a bit later in case the iframe's own applyTheme fires after us
    const t1 = setTimeout(applyToIframe, 200);
    const t2 = setTimeout(applyToIframe, 700);
    const t3 = setTimeout(applyToIframe, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, viewMode]);

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
    const toastId = toast.loading('Saving branding theme…');
    setSaving(true);
    try {
      const { data } = await api.patch('/settings/theme', theme);
      setStoreTheme(data);
      toast.dismiss(toastId);
      toast.saved('Branding theme');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save failed", err);
      toast.dismiss(toastId);
      toast.error('Failed to save branding theme', 'Check your connection and try again');
    } finally {
      setSaving(false);
    }
  };

  const filteredFonts = GOOGLE_FONTS.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(fontSearch.toLowerCase());
    const matchesCategory = fontCategory === 'All' || f.category === fontCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* ── Left: Controls ── */}
      <div className="w-[420px] flex-shrink-0 overflow-y-auto pr-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Branding</h1>
            <p className="text-gray-400 text-sm mt-0.5">Customize your menu appearance</p>
          </div>
        </div>

        {/* Dynamic sub-page categories navigation — 2 rows × 3 cols so labels never truncate */}
        <div className="grid grid-cols-3 gap-1 mb-5">
          {[
            { id: 'general',    label: 'Style & Colors', icon: '🎨' },
            { id: 'menu',       label: 'Menu Page',       icon: '🍔' },
            { id: 'about',      label: 'About',           icon: '🏔' },
            { id: 'reviews',    label: 'Reviews',         icon: '💬' },
            { id: 'location',   label: 'Location',        icon: '📍' },
            { id: 'animations', label: 'Animations',      icon: '🎬' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="leading-tight text-center whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* ── Tab: Style & Colors ── */}
          {activeTab === 'general' && (
            <>
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

              {/* Test Toast Notifications */}
              <Section title="Test Notification System">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toast.success('Changes Saved', 'Theme settings have been successfully published!')}
                    className="px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 text-green-400 rounded-lg text-xs font-semibold transition-all cursor-pointer">
                    ✅ Success
                  </button>
                  <button
                    onClick={() => toast.error('Error Occurred', 'Failed to connect to database server.')}
                    className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer">
                    ❌ Error
                  </button>
                  <button
                    onClick={() => toast.warning('Storage Limit', 'Your QR code scanning limit is at 90%.')}
                    className="px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/40 text-yellow-400 rounded-lg text-xs font-semibold transition-all cursor-pointer">
                    ⚠️ Warning
                  </button>
                  <button
                    onClick={() => toast.info('New Update', 'Version 2.4.0 is now live with enhanced animations.')}
                    className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 rounded-lg text-xs font-semibold transition-all cursor-pointer">
                    ℹ️ Info
                  </button>
                  <button
                    onClick={() => {
                      const id = toast.loading('Uploading assets...');
                      setTimeout(() => {
                        toast.dismiss(id);
                        toast.success('Upload complete!', 'All custom branding assets uploaded successfully.');
                      }, 2000);
                    }}
                    className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 rounded-lg text-xs font-semibold transition-all col-span-2 cursor-pointer">
                    ⏳ Simulated Loading (2s)
                  </button>
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
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search fonts..."
                      value={fontSearch}
                      onChange={e => setFontSearch(e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-500"
                    />
                    <select
                      value={fontCategory}
                      onChange={e => setFontCategory(e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-amber-500">
                      <option>All</option>
                      <option>Serif</option>
                      <option>Sans-serif</option>
                      <option>Display</option>
                      <option>Handwriting</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Heading font</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-700 rounded-lg bg-gray-800">
                      {filteredFonts.map(f => (
                        <button key={f.value}
                          onClick={() => update({ fontDisplay: f.value })}
                          className={`w-full text-left px-3 py-2 text-sm border-b border-gray-700 last:border-0 transition-colors ${
                            theme.fontDisplay === f.value
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                          style={{ fontFamily: f.value }}>
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Body font</label>
                    <div className="max-h-32 overflow-y-auto border border-gray-700 rounded-lg bg-gray-800">
                      {filteredFonts.map(f => (
                        <button key={f.value}
                          onClick={() => update({ fontBody: f.value })}
                          className={`w-full text-left px-3 py-2 text-sm border-b border-gray-700 last:border-0 transition-colors ${
                            theme.fontBody === f.value
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                          style={{ fontFamily: f.value }}>
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <div className="text-sm font-semibold mb-1" style={{ fontFamily: theme.fontDisplay }}>
                      Bella Vista Café
                    </div>
                    <div className="text-xs text-gray-400" style={{ fontFamily: theme.fontBody }}>
                      Authentic Ethiopian cuisine with modern flair
                    </div>
                  </div>
                </div>
              </Section>

              {/* Shape & Spacing */}
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
            </>
          )}

          {/* ── Tab: Menu Page ── */}
          {activeTab === 'menu' && (
            <>
              {/* Card Style */}
              <Section title="Card style">
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'default', label: 'Classic', desc: 'Image left, text right' },
                    { value: 'compact', label: 'Compact', desc: 'No image, inline' },
                    { value: 'imageTop', label: 'Image top', desc: 'Photo above text' },
                    { value: 'minimal', label: 'Minimal', desc: 'Borderless list' },
                    { value: 'bold', label: 'Bold', desc: 'Accent background' },
                  ] as const).map(style => (
                    <button key={style.value}
                      onClick={() => update({ cardStyle: style.value })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        theme.cardStyle === style.value
                          ? 'bg-amber-500/10 border-amber-500/40'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}>
                      <div className="text-xs font-medium text-white mb-0.5">{style.label}</div>
                      <div className="text-[10px] text-gray-500">{style.desc}</div>
                      <div className="mt-2 h-8 rounded border border-gray-700 bg-gray-900 flex items-center gap-1 px-1.5">
                        {style.value !== 'compact' && style.value !== 'minimal' && (
                          <div className="w-5 h-5 rounded bg-gray-700 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="h-1.5 w-full bg-gray-700 rounded mb-0.5" />
                          <div className="h-1 w-2/3 bg-gray-800 rounded" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Category Navigation */}
              <Section title="Category navigation">
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'pills', label: 'Pills', icon: '💊' },
                    { value: 'tabs', label: 'Tabs', icon: '📑' },
                    { value: 'dropdown', label: 'Dropdown', icon: '📋' },
                    { value: 'icons', label: 'Icons', icon: '🎨' },
                    { value: 'polygon', label: 'Polygon', icon: '⬢' },
                  ] as const).map(style => (
                    <button key={style.value}
                      onClick={() => update({ categoryStyle: style.value })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        theme.categoryStyle === style.value
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                      }`}>
                      <div className="text-xl mb-1">{style.icon}</div>
                      <div className="text-xs font-medium">{style.label}</div>
                    </button>
                  ))}
                </div>

                {theme.categoryStyle === 'polygon' && (
                  <div className="mt-3 pt-3 border-t border-gray-800">
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Polygon shape</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: 'hexagon', label: 'Hexagon', icon: '⬢' },
                        { value: 'diamond', label: 'Diamond', icon: '◆' },
                        { value: 'chevron', label: 'Chevron', icon: '›' },
                        { value: 'octagon', label: 'Octagon', icon: '⯃' },
                        { value: 'pentagon', label: 'Pentagon', icon: '⬟' },
                      ] as const).map(shape => (
                        <button key={shape.value}
                          onClick={() => update({ polygonVariant: shape.value })}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            (theme.polygonVariant || 'hexagon') === shape.value
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                          }`}>
                          <div className="text-lg mb-0.5">{shape.icon}</div>
                          <div className="text-[10px] font-medium">{shape.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              {/* Feature Toggles */}
              <Section title="Show / hide features">
                {[
                  { label: 'Item images',      key: 'showImages'   },
                  { label: 'Prices',           key: 'showPrice'    },
                  { label: 'Meal-time tabs',   key: 'showMealTabs' },
                  { label: 'Descriptions',     key: 'showDesc'     },
                  { label: 'Allergen info',    key: 'showAllergens' },
                  { label: 'Feature badges',   key: 'showBadges'   },
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
            </>
          )}

          {/* ── Tab: About Page ── */}
          {activeTab === 'about' && (
            <Section title="About page style">
              <p className="text-xs text-gray-500 mb-3">Layout when guests tap the About tab.</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'hero-story',   label: 'Hero Story',    desc: 'Cover photo + story',      icon: '🏔' },
                  { value: 'magazine',     label: 'Magazine',      desc: 'Editorial two-column',     icon: '📰' },
                  { value: 'timeline',     label: 'Timeline',      desc: 'Story milestones',         icon: '🕐' },
                  { value: 'minimal-card', label: 'Minimal Card',  desc: 'Clean card grid',          icon: '🃏' },
                  { value: 'cinematic',    label: 'Cinematic',     desc: 'Full-bleed immersive',     icon: '🎬' },
                  { value: 'split-screen', label: 'Split Screen',  desc: 'Image / content split',   icon: '◧' },
                  { value: 'editorial',    label: 'Editorial',     desc: 'Large typography',         icon: '✍️' },
                  { value: 'mosaic',       label: 'Mosaic',        desc: 'Photo grid + details',    icon: '🖼' },
                  { value: 'luxury',       label: 'Luxury',        desc: 'Gold-accented serif',      icon: '👑' },
                  { value: 'polaroid',     label: 'Polaroid',      desc: 'Stacked photo cards',      icon: '📷' },
                ] as const).map(s => (
                  <button key={s.value}
                    onClick={() => update({ aboutStyle: s.value })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      (theme.aboutStyle || 'hero-story') === s.value
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-xs font-medium text-white">{s.label}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 pl-6">{s.desc}</div>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* ── Tab: Reviews Page ── */}
          {activeTab === 'reviews' && (
            <Section title="Reviews page style">
              <p className="text-xs text-gray-500 mb-3">Layout for the guest Reviews tab.</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'spotlight', label: 'Spotlight', desc: 'Featured + list',            icon: '🔦' },
                  { value: 'masonry',   label: 'Masonry',   desc: 'Multi-column grid',           icon: '🧱' },
                  { value: 'wall',      label: 'Wall',      desc: 'Dense compact wall',          icon: '📋' },
                  { value: 'timeline',  label: 'Timeline',  desc: 'Chronological feed',          icon: '📅' },
                  { value: 'magazine',  label: 'Magazine',  desc: 'Editorial big quote',         icon: '❝' },
                  { value: 'bubble',    label: 'Bubble',    desc: 'Chat bubble layout',          icon: '💬' },
                  { value: 'podium',    label: 'Podium',    desc: 'Top 3 highlighted',           icon: '🏆' },
                  { value: 'minimal',   label: 'Minimal',   desc: 'Ultra-clean list',            icon: '☰' },
                  { value: 'cinematic', label: 'Cinematic', desc: 'Full-screen cards',           icon: '🎞' },
                  { value: 'cards',     label: 'Cards',     desc: 'Floating card deck',         icon: '🗂' },
                ] as const).map(s => (
                  <button key={s.value}
                    onClick={() => update({ reviewsStyle: s.value })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      (theme.reviewsStyle || 'spotlight') === s.value
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-xs font-medium text-white">{s.label}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 pl-6">{s.desc}</div>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* ── Tab: Find Us Page ── */}
          {activeTab === 'location' && (
            <Section title="Find Us page style">
              <p className="text-xs text-gray-500 mb-3">Layout for the guest Find Us tab.</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'card-stack',    label: 'Card Stack',   desc: 'Stacked info cards',         icon: '🗂' },
                  { value: 'split',         label: 'Split',        desc: 'Map + details beside',       icon: '◫' },
                  { value: 'hero-map',      label: 'Hero Map',     desc: 'Large map hero overlay',     icon: '🗺' },
                  { value: 'compact',       label: 'Compact',      desc: 'Tight inline list',          icon: '☰' },
                  { value: 'contact-card',  label: 'Contact Card', desc: 'Business card style',        icon: '💼' },
                  { value: 'glassmorphism', label: 'Glass',        desc: 'Translucent glass cards',    icon: '🔮' },
                  { value: 'minimal',       label: 'Minimal',      desc: 'Large-text clean',           icon: '◻' },
                  { value: 'luxury',        label: 'Luxury',       desc: 'Gold-trimmed layout',        icon: '✨' },
                  { value: 'directions',    label: 'Directions',   desc: 'Journey step-by-step',       icon: '🧭' },
                  { value: 'neon',          label: 'Neon',         desc: 'Vibrant accent style',       icon: '💡' },
                ] as const).map(s => (
                  <button key={s.value}
                    onClick={() => update({ locationStyle: s.value })}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      (theme.locationStyle || 'card-stack') === s.value
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-xs font-medium text-white">{s.label}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 pl-6">{s.desc}</div>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {/* ── Tab: Animations ── */}
          {activeTab === 'animations' && (
            <>
              {/* Hover animations */}
              <HoverSection theme={theme} update={update} />

              {/* Page animations */}
              <AnimationsSection theme={theme} update={update} />
            </>
          )}



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

      {/* ── Right: Live Preview ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="mb-3 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Live Preview</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Changes apply instantly</span>
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
              <div className="w-[280px] h-[560px] bg-gray-950 rounded-[2rem] shadow-2xl overflow-hidden border-[10px] border-gray-900 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-900 rounded-b-lg z-10" />
                <iframe
                  ref={mobileIframeRef}
                  src={`/menu/${venue?.slug}`}
                  className="w-full h-full"
                  style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.33%', height: '133.33%' }}
                  title="Guest Menu Preview"
                  onLoad={() => {
                    // Re-inject theme + tab after iframe finishes loading
                    setTimeout(() => {
                      applyToIframe();
                      const targetTab = activeTab === 'about' ? 'about' : activeTab === 'reviews' ? 'reviews' : activeTab === 'location' ? 'location' : 'menu';
                      sendTabMessage(targetTab);
                    }, 100);
                  }}
                />
              </div>
            ) : (
              <div className="w-[800px] h-[600px] bg-gray-950 rounded-lg shadow-2xl overflow-hidden border-2 border-gray-800 flex flex-col">
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
                <iframe
                  ref={desktopIframeRef}
                  src={`/menu/${venue?.slug}`}
                  className="w-full flex-1"
                  title="Guest Menu Preview"
                  onLoad={() => {
                    setTimeout(() => {
                      applyToIframe();
                      const targetTab = activeTab === 'about' ? 'about' : activeTab === 'reviews' ? 'reviews' : activeTab === 'location' ? 'location' : 'menu';
                      sendTabMessage(targetTab);
                    }, 100);
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
