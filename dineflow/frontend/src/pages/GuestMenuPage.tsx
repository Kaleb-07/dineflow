import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, X, ChevronDown } from 'lucide-react';
import { applyTheme } from '../hooks/useTheme';
import type { Venue, MenuItem, Variant, Review } from '../types';
import api from '../lib/axios';

type Tab = 'menu' | 'about' | 'reviews' | 'location';
type MealTab = 'BREAKFAST' | 'LUNCH' | 'DINNER';
type MenuType = 'FOOD' | 'DRINK';

export default function GuestMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const [venue,   setVenue]   = useState<Venue | null>(null);
  const [tab,     setTab]     = useState<Tab>('menu');
  const [meal,    setMeal]    = useState<MealTab>('LUNCH');
  const [type,    setType]    = useState<MenuType>('FOOD');
  const [catId,   setCatId]   = useState<number | null>(null);
  const [item,    setItem]    = useState<MenuItem | null>(null);
  const [review,  setReview]  = useState(false);
  const [location,setLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Synchronize active sheet/tab with parent customizer
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'SET_PREVIEW_TAB') {
        const targetTab = e.data.tab;
        if (targetTab === 'location') {
          setLocation(true);
          setTab('menu');
        } else {
          setLocation(false);
          setTab(targetTab);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Category change handler with animation trigger
  const changeCategory = (id: number) => {
    setSwitching(true);
    setCatId(id);
    setTimeout(() => setSwitching(false), 800);
  };

  // Apply defaults immediately on mount — no flash
  useEffect(() => {
    applyTheme({
      bgColor: '#0d1f1a', accentColor: '#c9a84c',
      cardColor: '#122219', textColor: '#e8e0d0',
      fontDisplay: "'Cormorant Garamond', serif",
      fontBody: "'DM Sans', sans-serif",
      borderRadius: 8, cardPadding: 8, itemGap: 6,
      showImages: true, showPrice: true,
      showMealTabs: true, showDesc: true,
      animateItems: false, animateHover: false,
      animatePrice: false, animateCategories: false, animationSpeed: 5,
      entranceStyle: 'fade-up', priceFx: 'shimmer',
      categoryFx: 'crossfade', animSpeed: 5,
      aboutStyle: 'hero-story', reviewsStyle: 'spotlight', locationStyle: 'card-stack',
    });
  }, []);

  useEffect(() => {
    if (!slug) return;
    api.get(`/public/${slug}`).then(({ data }) => {
      setVenue(data);
      if (data.theme) applyTheme(data.theme);
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen guest-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="guest-accent text-sm">Loading menu…</div>
      </div>
    </div>
  );

  if (!venue) return (
    <div className="min-h-screen guest-bg flex items-center justify-center">
      <div className="text-center text-gray-400">Menu not found</div>
    </div>
  );

  const cats = venue.categories?.filter(c => c.type === type) || [];
  const activeCat = catId ?? cats[0]?.id ?? null;
  const items = cats.find(c => c.id === activeCat)?.items || [];
  const avgRating = venue.reviews?.length
    ? (venue.reviews.reduce((a, r) => a + r.rating, 0) / venue.reviews.length).toFixed(1)
    : null;

  return (
    <>
      <div className="guest-page-root guest-bg min-h-screen max-w-md mx-auto flex flex-col" style={{ fontFamily: 'var(--brand-font-body)' }}>

      {/* ── Top bar ── */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold guest-heading" style={{ fontFamily: 'var(--brand-font-display)' }}>
              {venue.name}
            </h1>
            {venue.tagline && <p className="guest-accent text-xs tracking-widest uppercase mt-0.5">{venue.tagline}</p>}
          </div>
          {venue.logo && <img src={venue.logo} className="w-10 h-10 rounded-full object-cover" alt={venue.name} />}
        </div>
      </div>

      {/* ── Meal tabs ── */}
      {venue.theme?.showMealTabs !== false && (
        <div className="flex border-b px-4 flex-shrink-0" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
          {(['BREAKFAST','LUNCH','DINNER'] as MealTab[]).map(m => (
            <button key={m} onClick={() => setMeal(m)}
              className="flex-1 py-2 text-xs font-medium tracking-widest uppercase transition-colors"
              style={{ color: meal === m ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 40%, transparent)',
                       borderBottom: meal === m ? '2px solid var(--brand-accent)' : '2px solid transparent' }}>
              {m[0] + m.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {/* ── Food / Drink toggle ── */}
      <div className="mx-4 mt-3 flex rounded-full p-0.5 flex-shrink-0"
        style={{ background: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-accent) 20%, transparent)' }}>
        {(['FOOD','DRINK'] as MenuType[]).map(t => (
          <button key={t} onClick={() => { setType(t); setCatId(null); }}
            className="flex-1 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all"
            style={{
              background: type === t ? 'var(--brand-accent)' : 'transparent',
              color: type === t ? 'var(--brand-bg)' : 'var(--brand-accent)'
            }}>
            {t[0] + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* ── Category chips ── */}
      {cats.length > 0 && (
        <div className="category-chips-wrapper px-4 mt-3 flex-shrink-0">
          <button
            className="dropdown-trigger w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all mb-2"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'var(--brand-card)',
              borderColor: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)',
              color: 'var(--brand-text)',
              display: 'none'
            }}>
            <span className="flex items-center gap-2">
              <span className="text-lg">{cats.find(c => c.id === activeCat)?.icon}</span>
              <span className="text-sm font-medium">{cats.find(c => c.id === activeCat)?.name || 'Select category'}</span>
            </span>
            <ChevronDown size={18} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          </button>

          <div className={`category-chips flex gap-2 overflow-x-auto pb-1 ${dropdownOpen ? 'dropdown-open' : ''}`} style={{ scrollbarWidth: 'none' }}>
            {cats.map(c => (
              <button key={c.id}
                onClick={() => { changeCategory(c.id); setDropdownOpen(false); }}
                className={`category-chip flex items-center flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${activeCat === c.id ? 'active' : ''}`}
                style={{
                  background: activeCat === c.id ? 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' : 'transparent',
                  borderColor: activeCat === c.id ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-accent) 20%, transparent)',
                  color: activeCat === c.id ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 60%, transparent)'
                }}>
                <span className="icon mr-1">{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Item list ── */}
      <div className={`item-list flex-1 overflow-y-auto px-4 mt-3 pb-24 space-y-2 ${switching ? 'category-switching' : ''}`} key={activeCat}>
        {items.length === 0 && (
          <div className="text-center py-12" style={{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }}>
            No items in this category
          </div>
        )}
        {items.map((i, index) => (
          <button key={`${activeCat}-${i.id}`} onClick={() => setItem(i)} className="w-full text-left">
            <div
              className="menu-card guest-card flex gap-3 border"
              style={{
                borderColor: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)',
                marginBottom: 'var(--brand-gap)',
                '--card-index': index
              } as React.CSSProperties}
            >
              <div className="item-image w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
                style={{ background: 'color-mix(in srgb, var(--brand-accent) 8%, transparent)', borderRadius: 'calc(var(--brand-radius) - 2px)' }}>
                {i.image
                  ? <img src={i.image} className="w-full h-full object-cover" alt={i.name} />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">
                      {venue.categories?.find(c => c.id === i.categoryId)?.icon || '🍽'}
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <span className="item-name text-sm font-medium guest-heading">{i.name}</span>
                  {i.isFeatured && <span className="text-xs flex-shrink-0" style={{ color: 'var(--brand-accent)' }}>★</span>}
                </div>
                <p className="item-desc text-xs mt-0.5 line-clamp-2">{i.description}</p>
                <span className="item-price text-xs font-semibold mt-1.5">
                  {i.variants.length > 0
                    ? `from ${Math.min(...i.variants.map(v => v.price))} ${venue.currency}`
                    : '—'
                  }
                </span>
              </div>
              <ChevronRight size={14} className="self-center flex-shrink-0"
                style={{ color: 'color-mix(in srgb, var(--brand-accent) 40%, transparent)' }} />
            </div>
          </button>
        ))}
      </div>

      {/* ── Bottom nav ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t flex"
        style={{ background: 'var(--brand-bg)', borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
        {([
          { id: 'menu',     label: 'Menu',    icon: '🍽' },
          { id: 'about',    label: 'About',   icon: '🏨' },
          { id: 'reviews',  label: 'Reviews', icon: '⭐' },
          { id: 'location', label: 'Find us', icon: '📍' },
        ] as { id: Tab; label: string; icon: string }[]).map(n => (
          <button key={n.id}
            onClick={() => n.id === 'location' ? setLocation(true) : setTab(n.id)}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-all">
            <span className="text-base">{n.icon}</span>
            <span className="text-xs" style={{ color: tab === n.id ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }}>
              {n.label}
            </span>
          </button>
        ))}
      </div>
    </div>

      {/* ── Item detail popup ── */}
      {item && <ItemModal item={item} venue={venue} onClose={() => setItem(null)} />}

      {/* ── Review form popup ── */}
      {review && <ReviewModal slug={slug!} onClose={() => setReview(false)} />}

      {/* ── Location popup ── */}
      {location && <LocationModal venue={venue} onClose={() => setLocation(false)} />}

      {/* ── About / Reviews tab content ── */}
      {tab === 'about' && <AboutSheet venue={venue} onClose={() => setTab('menu')} />}
      {tab === 'reviews' && (
        <ReviewsSheet
          reviews={venue.reviews || []}
          avgRating={avgRating}
          onLeaveReview={() => setReview(true)}
          onClose={() => setTab('menu')}
        />
      )}
    </>
  );
}

// ── Item detail modal ──────────────────────────────────
function ItemModal({ item, venue, onClose }: { item: MenuItem; venue: Venue; onClose: () => void }) {
  const [selected, setSelected] = useState<Variant | null>(
    item.variants.find(v => v.isDefault) || item.variants[0] || null
  );
  return (
    <Sheet onClose={onClose}>
      {item.image && (
        <div className="w-full h-44 overflow-hidden rounded-xl mb-4"
          style={{ background: 'color-mix(in srgb, var(--brand-accent) 8%, transparent)' }}>
          <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
        </div>
      )}
      <h2 className="text-xl font-semibold guest-heading mb-1"
        style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>
        {item.name}
      </h2>
      {item.description && (
        <p className="text-sm mb-4" style={{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }}>
          {item.description}
        </p>
      )}
      {(item.ingredients as string[])?.length > 0 && (
        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--brand-accent)' }}>Ingredients</div>
          <div className="flex flex-wrap gap-1.5">
            {(item.ingredients as string[]).map(ing => (
              <span key={ing} className="text-xs px-2.5 py-1 rounded-full border"
                style={{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)',
                         borderColor: 'color-mix(in srgb, var(--brand-accent) 20%, transparent)',
                         background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)' }}>
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}
      {item.variants.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--brand-accent)' }}>Choose size</div>
          <div className="space-y-2">
            {item.variants.map(v => (
              <button key={v.id} onClick={() => setSelected(v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
                style={{
                  borderColor: selected?.id === v.id ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-accent) 20%, transparent)',
                  background: selected?.id === v.id ? 'color-mix(in srgb, var(--brand-accent) 10%, transparent)' : 'transparent',
                }}>
                <span className="text-sm" style={{ color: 'var(--brand-text)' }}>{v.label}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--brand-accent)' }}>
                  {v.price} {venue.currency}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ── Review form modal ──────────────────────────────────
function ReviewModal({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [form, setForm] = useState({ type: 'HOTEL', rating: 5, guestName: '', comment: '' });
  const [saving, setSaving] = useState(false);
  const [done,   setDone]   = useState(false);
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

  const submit = async () => {
    setSaving(true);
    await api.post(`/public/${slug}/review`, form);
    setDone(true);
    setSaving(false);
    setTimeout(onClose, 1500);
  };

  return (
    <Sheet onClose={onClose} title="Share your experience">
      {done ? (
        <div className="text-center py-8" style={{ color: 'var(--brand-accent)' }}>✓ Thank you for your review!</div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['HOTEL','FOOD','SERVICE'].map(t => (
              <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                className="flex-1 py-2 rounded-lg text-xs font-medium border transition-all"
                style={{
                  background: form.type === t ? 'color-mix(in srgb, var(--brand-accent) 12%, transparent)' : 'transparent',
                  borderColor: form.type === t ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-accent) 20%, transparent)',
                  color: form.type === t ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 50%, transparent)'
                }}>
                {t[0] + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, rating: s }))} className="text-2xl transition-transform hover:scale-110">
                  <span style={{ color: s <= form.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 20%, transparent)' }}>★</span>
                </button>
              ))}
            </div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--brand-accent)' }}>{labels[form.rating]}</div>
          </div>
          <input
            className="w-full text-sm px-3 py-2 rounded-lg outline-none"
            style={{ background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)',
                     border: '1px solid color-mix(in srgb, var(--brand-accent) 20%, transparent)',
                     color: 'var(--brand-text)' }}
            placeholder="Your name (optional)"
            value={form.guestName}
            onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))}
          />
          <textarea
            className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none h-20"
            style={{ background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)',
                     border: '1px solid color-mix(in srgb, var(--brand-accent) 20%, transparent)',
                     color: 'var(--brand-text)' }}
            placeholder="Tell us about your experience…"
            value={form.comment}
            onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
          />
          <button onClick={submit} disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: 'var(--brand-accent)', color: 'var(--brand-bg)' }}>
            {saving ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      )}
    </Sheet>
  );
}

// ── Shared helpers ─────────────────────────────────────
const AMENITY_EMOJI: Record<string, string> = {
  wifi: '📶', car: '🚗', wind: '❄️', waves: '🏊', utensils: '🍽️',
  'glass-water': '🍸', dumbbell: '💪', sparkles: '✨', sofa: '🛋️',
  'chef-hat': '👨‍🍳', 'building-2': '🏙️', 'paw-print': '🐾',
  key: '🔑', bike: '🚴', package: '📦',
};

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_SHORT: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed',
  thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

function formatTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-widest font-medium" style={{ color: 'var(--brand-accent)' }}>{children}</div>;
}

function InfoRow({ icon, accent, children }: { icon: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm rounded-xl px-3 py-2.5"
      style={{
        background: 'color-mix(in srgb, var(--brand-accent) 5%, transparent)',
        color: accent ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 70%, transparent)',
      }}>
      <span className="text-base leading-none">{icon}</span>
      <span className="leading-snug">{children}</span>
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all active:scale-95"
      style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)', color: 'var(--brand-accent)', background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)' }}>
      <span>{icon}</span>{label}
    </a>
  );
}

// Custom hook to listen to dataset changes on document.documentElement
function useDatasetAttribute(attrName: string, defaultValue: string) {
  const [val, setVal] = useState(() => document.documentElement.getAttribute(attrName) || defaultValue);
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setVal(document.documentElement.getAttribute(attrName) || defaultValue);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: [attrName] });
    return () => observer.disconnect();
  }, [attrName, defaultValue]);
  return val;
}

// ── ABOUT SHEET — 10 styles ────────────────────────────
function AboutSheet({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const style = useDatasetAttribute('data-about-style', 'hero-story');
  const hasSocial  = !!(venue.facebook || venue.instagram || venue.twitter || venue.tiktok || venue.website);
  const hasHours   = !!venue.businessHours;
  const hasContact = !!(venue.phone || venue.email || venue.address);

  const HoursBlock = () => hasHours ? (
    <div className="mb-6">
      <SectionLabel>Business Hours</SectionLabel>
      <div className="mt-3 rounded-xl border overflow-hidden" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
        {DAYS.map((day, idx) => {
          const entry = (venue.businessHours as any)?.[day];
          return (
            <div key={day} className="flex items-center justify-between px-4 py-2.5"
              style={{ background: 'color-mix(in srgb, var(--brand-accent) 3%, transparent)', borderTop: idx > 0 ? '1px solid color-mix(in srgb, var(--brand-accent) 10%, transparent)' : 'none' }}>
              <span className="text-xs font-medium" style={{ color: 'color-mix(in srgb, var(--brand-text) 80%, transparent)' }}>{DAY_SHORT[day]}</span>
              {entry?.closed
                ? <span className="text-xs italic" style={{ color: 'color-mix(in srgb, var(--brand-text) 35%, transparent)' }}>Closed</span>
                : entry
                  ? <span className="text-xs" style={{ color: 'var(--brand-accent)' }}>{formatTime(entry.open)} – {formatTime(entry.close)}</span>
                  : <span className="text-xs italic" style={{ color: 'color-mix(in srgb, var(--brand-text) 35%, transparent)' }}>—</span>
              }
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  const ContactBlock = () => hasContact ? (
    <div className="mb-6">
      <SectionLabel>Contact</SectionLabel>
      <div className="mt-3 space-y-2">
        {venue.address && <InfoRow icon="📍">{venue.address}{venue.city ? `, ${venue.city}` : ''}{venue.country ? `, ${venue.country}` : ''}</InfoRow>}
        {venue.phone && <a href={`tel:${venue.phone}`} className="block"><InfoRow icon="📞" accent>{venue.phone}</InfoRow></a>}
        {venue.email && <a href={`mailto:${venue.email}`} className="block"><InfoRow icon="✉️" accent>{venue.email}</InfoRow></a>}
      </div>
    </div>
  ) : null;

  const SocialBlock = () => hasSocial ? (
    <div className="mb-4">
      <SectionLabel>Find us online</SectionLabel>
      <div className="flex flex-wrap gap-2 mt-3">
        {venue.facebook  && <SocialLink href={venue.facebook}  icon="📘" label="Facebook"  />}
        {venue.instagram && <SocialLink href={venue.instagram} icon="📸" label="Instagram" />}
        {venue.twitter   && <SocialLink href={venue.twitter}   icon="🐦" label="Twitter"   />}
        {venue.tiktok    && <SocialLink href={venue.tiktok}    icon="🎵" label="TikTok"    />}
        {venue.website   && <SocialLink href={venue.website}   icon="🌐" label="Website"   />}
      </div>
    </div>
  ) : null;

  const AmenitiesBlock = () => (venue.amenities?.length ?? 0) > 0 ? (
    <div className="mb-6">
      <SectionLabel>Amenities</SectionLabel>
      <div className="flex flex-wrap gap-2 mt-3">
        {venue.amenities!.map(a => (
          <span key={a.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
            style={{ color: 'color-mix(in srgb, var(--brand-text) 75%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 25%, transparent)', background: 'color-mix(in srgb, var(--brand-accent) 5%, transparent)' }}>
            <span>{AMENITY_EMOJI[a.icon] ?? '✨'}</span>{a.name}
          </span>
        ))}
      </div>
    </div>
  ) : null;

  // ── hero-story (default)
  if (style === 'hero-story' || !style) {
    return (
      <FullSheet onClose={onClose}>
        {venue.coverPhoto && <div className="h-44 overflow-hidden mb-4 rounded-2xl -mx-4"><img src={venue.coverPhoto} className="w-full h-full object-cover" alt="" /></div>}
        <div className="flex items-center gap-3 mb-4">
          {venue.logo && <img src={venue.logo} className="w-14 h-14 rounded-xl object-cover border flex-shrink-0" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 25%, transparent)' }} alt={venue.name} />}
          <div>
            <h2 className="text-xl font-semibold" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
            {venue.tagline && <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: 'var(--brand-accent)' }}>{venue.tagline}</p>}
          </div>
        </div>
        {venue.description && <p className="text-sm leading-relaxed mb-6" style={{ color: 'color-mix(in srgb, var(--brand-text) 65%, transparent)' }}>{venue.description}</p>}
        <AmenitiesBlock /><HoursBlock /><ContactBlock /><SocialBlock />
      </FullSheet>
    );
  }

  // ── magazine
  if (style === 'magazine') {
    return (
      <FullSheet onClose={onClose}>
        <div className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--brand-accent)' }}>Our Story</div>
        <h2 className="text-3xl font-bold mb-4 leading-tight" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
        {venue.coverPhoto && <div className="float-right w-36 h-36 rounded-xl overflow-hidden ml-4 mb-2 flex-shrink-0"><img src={venue.coverPhoto} className="w-full h-full object-cover" alt="" /></div>}
        {venue.description && <p className="text-sm leading-loose mb-6 about-desc" style={{ color: 'color-mix(in srgb, var(--brand-text) 65%, transparent)' }}>{venue.description}</p>}
        <div style={{ clear: 'both' }} />
        {venue.tagline && (
          <blockquote className="border-l-2 pl-4 py-1 mb-6 italic text-base" style={{ borderColor: 'var(--brand-accent)', color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)', fontFamily: 'var(--brand-font-display)' }}>
            "{venue.tagline}"
          </blockquote>
        )}
        <AmenitiesBlock /><HoursBlock /><ContactBlock /><SocialBlock />
      </FullSheet>
    );
  }

  // ── timeline
  if (style === 'timeline') {
    const milestones = [
      venue.tagline && { label: 'Our Mission', text: venue.tagline },
      venue.description && { label: 'Our Story', text: venue.description },
      hasContact && { label: 'Find Us', text: [venue.address, venue.city].filter(Boolean).join(', ') },
    ].filter(Boolean) as { label: string; text: string }[];
    return (
      <FullSheet onClose={onClose}>
        {venue.logo && <img src={venue.logo} className="w-16 h-16 rounded-full object-cover mb-4 border-2" style={{ borderColor: 'var(--brand-accent)' }} alt={venue.name} />}
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
        <div className="relative pl-6 border-l mb-6" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)' }}>
          {milestones.map((m, i) => (
            <div key={i} className="mb-6 relative">
              <div className="absolute -left-[25px] w-3 h-3 rounded-full border-2 top-1" style={{ background: 'var(--brand-bg)', borderColor: 'var(--brand-accent)' }} />
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>{m.label}</div>
              <div className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }}>{m.text}</div>
            </div>
          ))}
        </div>
        <AmenitiesBlock /><HoursBlock /><ContactBlock /><SocialBlock />
      </FullSheet>
    );
  }

  // ── minimal-card
  if (style === 'minimal-card') {
    return (
      <FullSheet onClose={onClose}>
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
        {venue.tagline && <p className="text-xs tracking-widest uppercase mb-5" style={{ color: 'var(--brand-accent)' }}>{venue.tagline}</p>}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {venue.description && (
            <div className="col-span-2 rounded-2xl p-4 border" style={{ background: 'color-mix(in srgb, var(--brand-accent) 4%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }}>{venue.description}</p>
            </div>
          )}
          {venue.phone && (
            <a href={`tel:${venue.phone}`} className="rounded-2xl p-4 border flex flex-col gap-1" style={{ background: 'color-mix(in srgb, var(--brand-accent) 4%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)' }}>
              <span className="text-xl">📞</span>
              <span className="text-xs" style={{ color: 'var(--brand-accent)' }}>{venue.phone}</span>
            </a>
          )}
          {venue.address && (
            <div className="rounded-2xl p-4 border flex flex-col gap-1" style={{ background: 'color-mix(in srgb, var(--brand-accent) 4%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)' }}>
              <span className="text-xl">📍</span>
              <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }}>{venue.city || venue.address}</span>
            </div>
          )}
        </div>
        <AmenitiesBlock /><HoursBlock /><SocialBlock />
      </FullSheet>
    );
  }

  // ── cinematic
  if (style === 'cinematic') {
    return (
      <FullSheet onClose={onClose} noPadding>
        {venue.coverPhoto && (
          <div className="relative h-56 overflow-hidden">
            <img src={venue.coverPhoto} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--brand-bg))' }} />
            <div className="absolute bottom-4 left-4">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
              {venue.tagline && <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--brand-accent)' }}>{venue.tagline}</p>}
            </div>
          </div>
        )}
        <div className="px-4 py-4">
          {!venue.coverPhoto && <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>}
          {venue.description && <p className="text-sm leading-relaxed mb-6" style={{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }}>{venue.description}</p>}
          <AmenitiesBlock /><HoursBlock /><ContactBlock /><SocialBlock />
        </div>
      </FullSheet>
    );
  }

  // ── split-screen
  if (style === 'split-screen') {
    return (
      <FullSheet onClose={onClose}>
        <div className="flex gap-3 mb-5 about-sheet-content">
          {(venue.coverPhoto || venue.logo) && (
            <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={venue.coverPhoto || venue.logo!} className="w-full h-full object-cover" alt="" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
            {venue.tagline && <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--brand-accent)' }}>{venue.tagline}</p>}
            {venue.description && <p className="text-xs leading-relaxed line-clamp-4" style={{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }}>{venue.description}</p>}
          </div>
        </div>
        <AmenitiesBlock /><HoursBlock /><ContactBlock /><SocialBlock />
      </FullSheet>
    );
  }

  // ── editorial
  if (style === 'editorial') {
    return (
      <FullSheet onClose={onClose}>
        <div className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: 'var(--brand-accent)' }}>About</div>
        <h2 className="text-4xl font-black leading-none mb-6" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
        {venue.description && <p className="text-base leading-loose mb-8 font-light" style={{ color: 'color-mix(in srgb, var(--brand-text) 75%, transparent)', fontFamily: 'var(--brand-font-display)' }}>{venue.description}</p>}
        <div className="h-px mb-6" style={{ background: 'color-mix(in srgb, var(--brand-accent) 20%, transparent)' }} />
        <AmenitiesBlock /><HoursBlock /><ContactBlock /><SocialBlock />
      </FullSheet>
    );
  }

  // ── mosaic
  if (style === 'mosaic') {
    return (
      <FullSheet onClose={onClose}>
        {venue.coverPhoto && (
          <div className="grid grid-cols-3 gap-1 mb-5 -mx-4">
            {[venue.coverPhoto, venue.logo || venue.coverPhoto, venue.coverPhoto].map((src, i) => (
              <div key={i} className={`overflow-hidden ${i === 0 ? 'col-span-2 h-32' : 'h-32'}`}>
                <img src={src!} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        )}
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
        {venue.tagline && <p className="text-xs tracking-widest uppercase mb-4" style={{ color: 'var(--brand-accent)' }}>{venue.tagline}</p>}
        {venue.description && <p className="text-sm leading-relaxed mb-6" style={{ color: 'color-mix(in srgb, var(--brand-text) 65%, transparent)' }}>{venue.description}</p>}
        <AmenitiesBlock /><HoursBlock /><ContactBlock /><SocialBlock />
      </FullSheet>
    );
  }

  // ── luxury
  if (style === 'luxury') {
    return (
      <FullSheet onClose={onClose}>
        <div className="text-center mb-6">
          {venue.logo && <img src={venue.logo} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2" style={{ borderColor: 'var(--brand-accent)' }} alt={venue.name} />}
          <div className="text-xs tracking-[0.5em] uppercase mb-1" style={{ color: 'var(--brand-accent)' }}>✦ Established ✦</div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
          {venue.tagline && <p className="text-xs tracking-widest uppercase mt-1" style={{ color: 'color-mix(in srgb, var(--brand-accent) 70%, transparent)' }}>{venue.tagline}</p>}
        </div>
        <div className="border-t border-b py-6 mb-6 about-divider" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 20%, transparent)' }}>
          {venue.description && <p className="text-sm leading-loose text-center italic" style={{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)', fontFamily: 'var(--brand-font-display)' }}>{venue.description}</p>}
        </div>
        <AmenitiesBlock /><HoursBlock /><ContactBlock /><SocialBlock />
      </FullSheet>
    );
  }

  // ── polaroid
  return (
    <FullSheet onClose={onClose}>
      {venue.coverPhoto && (
        <div className="mx-auto w-52 mb-6 polaroid-photo" style={{ rotate: '1deg', background: 'white', padding: '8px 8px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderRadius: '4px' }}>
          <img src={venue.coverPhoto} className="w-full h-40 object-cover" alt="" />
          <p className="text-center text-xs mt-2" style={{ color: '#333', fontFamily: 'cursive' }}>{venue.name}</p>
        </div>
      )}
      <h2 className="text-xl font-bold mb-1 text-center" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h2>
      {venue.tagline && <p className="text-xs tracking-widest uppercase mb-5 text-center" style={{ color: 'var(--brand-accent)' }}>{venue.tagline}</p>}
      {venue.description && <p className="text-sm leading-relaxed mb-6" style={{ color: 'color-mix(in srgb, var(--brand-text) 65%, transparent)' }}>{venue.description}</p>}
      <AmenitiesBlock /><HoursBlock /><ContactBlock /><SocialBlock />
    </FullSheet>
  );
}

// ── REVIEWS SHEET — 10 styles ──────────────────────────
function ReviewsSheet({ reviews, avgRating, onLeaveReview, onClose }: {
  reviews: Review[]; avgRating: string | null; onLeaveReview: () => void; onClose: () => void
}) {
  const style = useDatasetAttribute('data-reviews-style', 'spotlight');
  const [cinIdx, setCinIdx] = useState(0);

  const LeaveBtn = () => (
    <button onClick={onLeaveReview} className="w-full py-2.5 rounded-xl text-sm font-medium border mb-5 transition-all"
      style={{ borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)' }}>
      Share your experience
    </button>
  );

  const RatingHeader = ({ compact }: { compact?: boolean }) => (
    <div className={`flex items-center gap-4 ${compact ? 'mb-3' : 'mb-5'}`}>
      <div className={`font-bold ${compact ? 'text-3xl' : 'text-5xl'}`} style={{ color: 'var(--brand-accent)', fontFamily: 'var(--brand-font-display)' }}>{avgRating || '—'}</div>
      <div>
        <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s => <span key={s} style={{ color: 'var(--brand-accent)', fontSize: 12 }}>★</span>)}</div>
        <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }}>{reviews.length} reviews</div>
      </div>
    </div>
  );

  const Card = ({ r, large }: { r: Review; large?: boolean }) => (
    <div className={`rounded-xl border ${large ? 'p-4' : 'p-3'}`}
      style={{ background: 'color-mix(in srgb, var(--brand-accent) 4%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)' }}>
      <div className="flex items-center justify-between mb-1">
        <span className={`font-medium ${large ? 'text-base' : 'text-sm'}`} style={{ color: 'var(--brand-text)' }}>{r.guestName || 'Guest'}</span>
        <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 20%, transparent)', fontSize: large ? 12 : 10 }}>★</span>)}</div>
      </div>
      {r.comment && <p className={`leading-relaxed ${large ? 'text-sm' : 'text-xs'}`} style={{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }}>{r.comment}</p>}
    </div>
  );

  if (style === 'spotlight' || !style) {
    return <FullSheet onClose={onClose}><RatingHeader /><LeaveBtn />{reviews[0] && <div className="mb-4 featured-review-card"><Card r={reviews[0]} large /></div>}<div className="space-y-2">{reviews.slice(1).map(r => <Card key={r.id} r={r} />)}</div></FullSheet>;
  }

  if (style === 'masonry') {
    const col1 = reviews.filter((_, i) => i % 2 === 0);
    const col2 = reviews.filter((_, i) => i % 2 === 1);
    return <FullSheet onClose={onClose}><RatingHeader compact /><LeaveBtn /><div className="grid grid-cols-2 gap-2"><div className="space-y-2">{col1.map(r => <Card key={r.id} r={r} />)}</div><div className="space-y-2">{col2.map(r => <Card key={r.id} r={r} />)}</div></div></FullSheet>;
  }

  if (style === 'wall') {
    return (
      <FullSheet onClose={onClose}>
        <RatingHeader compact /><LeaveBtn />
        <div className="space-y-1">
          {reviews.map(r => (
            <div key={r.id} className="flex items-start gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'color-mix(in srgb, var(--brand-accent) 3%, transparent)', borderBottom: '1px solid color-mix(in srgb, var(--brand-accent) 8%, transparent)' }}>
              <div className="flex gap-0.5 flex-shrink-0 pt-0.5">{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 20%, transparent)', fontSize: 9 }}>★</span>)}</div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium mr-2" style={{ color: 'var(--brand-text)' }}>{r.guestName || 'Guest'}</span>
                {r.comment && <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--brand-text) 55%, transparent)' }}>{r.comment}</span>}
              </div>
            </div>
          ))}
        </div>
      </FullSheet>
    );
  }

  if (style === 'timeline') {
    return (
      <FullSheet onClose={onClose}>
        <RatingHeader compact /><LeaveBtn />
        <div className="relative pl-5 border-l" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 25%, transparent)' }}>
          {reviews.map(r => (
            <div key={r.id} className="mb-5 relative">
              <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full top-1" style={{ background: 'var(--brand-accent)' }} />
              <div className="text-xs mb-0.5" style={{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
              <div className="font-medium text-sm mb-1" style={{ color: 'var(--brand-text)' }}>{r.guestName || 'Guest'}</div>
              <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 20%, transparent)', fontSize: 10 }}>★</span>)}</div>
              {r.comment && <p className="text-xs leading-relaxed" style={{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      </FullSheet>
    );
  }

  if (style === 'magazine') {
    const featured = reviews[0];
    return (
      <FullSheet onClose={onClose}>
        <div className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--brand-accent)' }}>Guest Reviews</div>
        {featured?.comment && <blockquote className="text-xl font-light italic leading-snug mb-2" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>"{featured.comment}"</blockquote>}
        {featured && <p className="text-xs mb-5" style={{ color: 'var(--brand-accent)' }}>— {featured.guestName || 'Guest'}</p>}
        <div className="border-t pt-4 mb-4" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
          <RatingHeader compact /><LeaveBtn />
        </div>
        <div className="space-y-2">{reviews.slice(1).map(r => <Card key={r.id} r={r} />)}</div>
      </FullSheet>
    );
  }

  if (style === 'bubble') {
    return (
      <FullSheet onClose={onClose}>
        <RatingHeader compact /><LeaveBtn />
        <div className="space-y-3">
          {reviews.map((r, i) => (
            <div key={r.id} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${i % 2 === 0 ? 'rounded-tl-sm review-bubble-left' : 'rounded-tr-sm review-bubble-right'}`}
                style={{ background: i % 2 === 0 ? 'color-mix(in srgb, var(--brand-accent) 10%, transparent)' : 'color-mix(in srgb, var(--brand-accent) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-accent) 20%, transparent)' }}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--brand-accent)' }}>{r.guestName || 'Guest'}</span>
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 20%, transparent)', fontSize: 9 }}>★</span>)}</div>
                </div>
                {r.comment && <p className="text-xs leading-relaxed" style={{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }}>{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      </FullSheet>
    );
  }

  if (style === 'podium') {
    const top3 = reviews.slice(0, 3);
    const rest  = reviews.slice(3);
    const pColors = ['var(--brand-accent)', 'color-mix(in srgb, var(--brand-accent) 70%, transparent)', 'color-mix(in srgb, var(--brand-accent) 50%, transparent)'];
    return (
      <FullSheet onClose={onClose}>
        <RatingHeader compact /><LeaveBtn />
        <div className="grid grid-cols-3 gap-2 mb-5">
          {top3.map((r, i) => (
            <div key={r.id} className={`rounded-xl p-3 text-center border ${i === 0 ? 'podium-1st' : ''}`} style={{ background: 'color-mix(in srgb, var(--brand-accent) 5%, transparent)', borderColor: pColors[i] }}>
              <div className="text-xl mb-1">{['🥇','🥈','🥉'][i]}</div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--brand-text)' }}>{r.guestName || 'Guest'}</div>
              <div className="flex justify-center gap-0.5 mb-1">{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? pColors[i] : 'color-mix(in srgb, var(--brand-text) 15%, transparent)', fontSize: 9 }}>★</span>)}</div>
              {r.comment && <p className="text-[10px] line-clamp-2" style={{ color: 'color-mix(in srgb, var(--brand-text) 55%, transparent)' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
        <div className="space-y-2">{rest.map(r => <Card key={r.id} r={r} />)}</div>
      </FullSheet>
    );
  }

  if (style === 'minimal') {
    return (
      <FullSheet onClose={onClose}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl font-bold" style={{ color: 'var(--brand-accent)', fontFamily: 'var(--brand-font-display)' }}>{avgRating || '—'} ★</span>
          <span className="text-xs" style={{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }}>{reviews.length} reviews</span>
        </div>
        <LeaveBtn />
        <div className="divide-y" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)' }}>
          {reviews.map(r => (
            <div key={r.id} className="py-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: 'var(--brand-text)' }}>{r.guestName || 'Guest'}</span>
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 15%, transparent)', fontSize: 10 }}>★</span>)}</div>
              </div>
              {r.comment && <p className="text-xs mt-1" style={{ color: 'color-mix(in srgb, var(--brand-text) 55%, transparent)' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      </FullSheet>
    );
  }

  if (style === 'cinematic') {
    const cur = reviews[cinIdx];
    return (
      <FullSheet onClose={onClose}>
        <RatingHeader compact /><LeaveBtn />
        {cur ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center px-4 review-slide-box">
            <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= cur.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 15%, transparent)', fontSize: 22 }}>★</span>)}</div>
            {cur.comment && <p className="text-base italic leading-relaxed mb-4" style={{ color: 'var(--brand-text)', fontFamily: 'var(--brand-font-display)' }}>"{cur.comment}"</p>}
            <p className="text-xs" style={{ color: 'var(--brand-accent)' }}>— {cur.guestName || 'Guest'}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCinIdx(i => Math.max(0, i - 1))} disabled={cinIdx === 0}
                className="px-4 py-2 rounded-lg text-xs border disabled:opacity-30" style={{ borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)' }}>← Prev</button>
              <span className="text-xs self-center" style={{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }}>{cinIdx + 1} / {reviews.length}</span>
              <button onClick={() => setCinIdx(i => Math.min(reviews.length - 1, i + 1))} disabled={cinIdx === reviews.length - 1}
                className="px-4 py-2 rounded-lg text-xs border disabled:opacity-30" style={{ borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)' }}>Next →</button>
            </div>
          </div>
        ) : <div className="text-center py-8 text-xs" style={{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }}>No reviews yet</div>}
      </FullSheet>
    );
  }

  // ── cards (floating card deck) — default fallback
  return (
    <FullSheet onClose={onClose}>
      <RatingHeader /><LeaveBtn />
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={r.id} className="rounded-2xl border p-4 review-card-item"
            style={{ background: 'color-mix(in srgb, var(--brand-accent) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)', boxShadow: `0 ${4 + i * 2}px ${8 + i * 4}px rgba(0,0,0,0.25)` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--brand-text)' }}>{r.guestName || 'Guest'}</span>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 15%, transparent)', fontSize: 11 }}>★</span>)}</div>
            </div>
            {r.comment && <p className="text-xs leading-relaxed" style={{ color: 'color-mix(in srgb, var(--brand-text) 65%, transparent)' }}>{r.comment}</p>}
          </div>
        ))}
      </div>
    </FullSheet>
  );
}

// ── LOCATION MODAL — 10 styles ─────────────────────────
function LocationModal({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const style = useDatasetAttribute('data-location-style', 'card-stack');
  const fullAddress = [venue.address, venue.city, venue.country].filter(Boolean).join(', ');
  const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(fullAddress || venue.name)}`;

  const MapBtn = ({ className }: { className?: string }) => (
    <a href={mapUrl} target="_blank" rel="noreferrer"
      className={`flex flex-col items-center justify-center border rounded-xl ${className}`}
      style={{ background: 'color-mix(in srgb, var(--brand-accent) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 20%, transparent)', minHeight: 100 }}>
      <div className="text-3xl mb-1">🗺</div>
      <div className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>Open in Maps</div>
    </a>
  );

  if (style === 'card-stack' || !style) {
    return (
      <Sheet onClose={onClose} title="Find us">
        <div className="space-y-3">
          <MapBtn className="h-28 w-full" />
          {venue.address && (
            <div className="rounded-xl p-4 border" style={{ background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>Address</div>
              <div className="text-sm" style={{ color: 'var(--brand-text)' }}>{venue.address}<br />{venue.city}{venue.country ? `, ${venue.country}` : ''}</div>
            </div>
          )}
          {venue.phone && (
            <a href={`tel:${venue.phone}`} className="flex items-center justify-between rounded-xl p-4 border w-full"
              style={{ background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)', color: 'var(--brand-text)' }}>
              <span className="text-sm">{venue.phone}</span>
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'var(--brand-accent)', color: 'var(--brand-bg)' }}>Call now</span>
            </a>
          )}
          {venue.email && (
            <div className="rounded-xl p-4 border" style={{ background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>Email</div>
              <div className="text-sm" style={{ color: 'var(--brand-text)' }}>{venue.email}</div>
            </div>
          )}
        </div>
      </Sheet>
    );
  }

  if (style === 'split') {
    return (
      <Sheet onClose={onClose} title="Find us">
        <div className="flex gap-3">
          <MapBtn className="flex-1" />
          <div className="flex-1 space-y-3">
            {venue.address && <div><div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>Address</div><div className="text-xs leading-relaxed" style={{ color: 'var(--brand-text)' }}>{venue.address}<br />{venue.city}</div></div>}
            {venue.phone && <div><div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>Phone</div><a href={`tel:${venue.phone}`} className="text-xs" style={{ color: 'var(--brand-text)' }}>{venue.phone}</a></div>}
            {venue.email && <div><div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>Email</div><div className="text-xs" style={{ color: 'var(--brand-text)' }}>{venue.email}</div></div>}
          </div>
        </div>
      </Sheet>
    );
  }

  if (style === 'hero-map') {
    return (
      <Sheet onClose={onClose}>
        <MapBtn className="h-36 w-full mb-4" />
        <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h3>
        <div className="space-y-2">
          {venue.address && <InfoRow icon="📍">{fullAddress}</InfoRow>}
          {venue.phone && <a href={`tel:${venue.phone}`} className="block"><InfoRow icon="📞" accent>{venue.phone}</InfoRow></a>}
          {venue.email && <a href={`mailto:${venue.email}`} className="block"><InfoRow icon="✉️" accent>{venue.email}</InfoRow></a>}
        </div>
      </Sheet>
    );
  }

  if (style === 'compact') {
    return (
      <Sheet onClose={onClose} title="Find us">
        <div className="divide-y" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)' }}>
          {venue.address && <div className="py-2.5 flex items-center gap-3"><span className="text-base w-5">📍</span><span className="text-xs" style={{ color: 'var(--brand-text)' }}>{fullAddress}</span></div>}
          {venue.phone && <a href={`tel:${venue.phone}`} className="py-2.5 flex items-center gap-3 block"><span className="text-base w-5">📞</span><span className="text-xs" style={{ color: 'var(--brand-accent)' }}>{venue.phone}</span></a>}
          {venue.email && <div className="py-2.5 flex items-center gap-3"><span className="text-base w-5">✉️</span><span className="text-xs" style={{ color: 'var(--brand-text)' }}>{venue.email}</span></div>}
        </div>
        <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-4 w-full block py-2.5 rounded-xl text-sm font-medium text-center" style={{ background: 'var(--brand-accent)', color: 'var(--brand-bg)' }}>Open in Maps →</a>
      </Sheet>
    );
  }

  if (style === 'contact-card') {
    return (
      <Sheet onClose={onClose}>
        <div className="rounded-2xl border p-5 mb-4" style={{ background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 25%, transparent)' }}>
          <div className="flex items-center gap-3 mb-4">
            {venue.logo && <img src={venue.logo} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt={venue.name} />}
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--brand-text)', fontFamily: 'var(--brand-font-display)' }}>{venue.name}</div>
              {venue.tagline && <div className="text-xs" style={{ color: 'var(--brand-accent)' }}>{venue.tagline}</div>}
            </div>
          </div>
          <div className="space-y-1.5 text-xs" style={{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)' }}>
            {venue.address && <div>📍 {fullAddress}</div>}
            {venue.phone && <a href={`tel:${venue.phone}`} className="block" style={{ color: 'var(--brand-accent)' }}>📞 {venue.phone}</a>}
            {venue.email && <div>✉️ {venue.email}</div>}
          </div>
        </div>
        <a href={mapUrl} target="_blank" rel="noreferrer" className="w-full block py-2.5 rounded-xl text-sm font-medium text-center" style={{ background: 'var(--brand-accent)', color: 'var(--brand-bg)' }}>Get Directions →</a>
      </Sheet>
    );
  }

  if (style === 'glassmorphism') {
    const glassStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' };
    return (
      <Sheet onClose={onClose} title="Find us">
        <div className="space-y-3">
          {venue.address && <div className="rounded-2xl p-4 location-glass" style={glassStyle}><div className="text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--brand-accent)' }}>📍 Address</div><div className="text-sm" style={{ color: 'var(--brand-text)' }}>{fullAddress}</div></div>}
          {venue.phone && (
            <a href={`tel:${venue.phone}`} className="block rounded-2xl p-4 location-glass" style={glassStyle}>
              <div className="flex items-center justify-between">
                <div><div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>📞 Phone</div><div className="text-sm" style={{ color: 'var(--brand-text)' }}>{venue.phone}</div></div>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--brand-accent)', color: 'var(--brand-bg)' }}>Call</span>
              </div>
            </a>
          )}
          {venue.email && <div className="rounded-2xl p-4 location-glass" style={glassStyle}><div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>✉️ Email</div><div className="text-sm" style={{ color: 'var(--brand-text)' }}>{venue.email}</div></div>}
          <MapBtn className="h-24 w-full" />
        </div>
      </Sheet>
    );
  }

  if (style === 'minimal') {
    return (
      <Sheet onClose={onClose}>
        <div className="text-xs uppercase tracking-[0.4em] mb-3" style={{ color: 'var(--brand-accent)' }}>Find Us</div>
        {(venue.city || venue.address) && <div className="text-2xl font-light mb-2 leading-tight" style={{ color: 'var(--brand-text)', fontFamily: 'var(--brand-font-display)' }}>{venue.city || venue.address}</div>}
        {fullAddress && <div className="text-sm mb-6" style={{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }}>{fullAddress}</div>}
        <div className="space-y-3">
          {venue.phone && <a href={`tel:${venue.phone}`} className="text-sm block" style={{ color: 'var(--brand-accent)' }}>↗ {venue.phone}</a>}
          {venue.email && <div className="text-sm" style={{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }}>{venue.email}</div>}
          <a href={mapUrl} target="_blank" rel="noreferrer" className="text-sm block" style={{ color: 'var(--brand-accent)' }}>↗ Open in Maps</a>
        </div>
      </Sheet>
    );
  }

  if (style === 'luxury') {
    return (
      <Sheet onClose={onClose}>
        <div className="text-center mb-5">
          <div className="text-xs tracking-[0.5em] uppercase mb-2" style={{ color: 'var(--brand-accent)' }}>✦ Visit Us ✦</div>
          <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{venue.name}</h3>
        </div>
        <div className="border rounded-2xl overflow-hidden luxury-location-container" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)' }}>
          {venue.address && <div className="p-4 border-b" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}><div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>Address</div><div className="text-sm" style={{ color: 'var(--brand-text)' }}>{fullAddress}</div></div>}
          {venue.phone && <a href={`tel:${venue.phone}`} className="p-4 flex items-center justify-between block border-b" style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}><div><div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>Reservations</div><div className="text-sm" style={{ color: 'var(--brand-text)' }}>{venue.phone}</div></div><span className="text-lg">📞</span></a>}
          {venue.email && <div className="p-4"><div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>Email</div><div className="text-sm" style={{ color: 'var(--brand-text)' }}>{venue.email}</div></div>}
        </div>
        <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-4 w-full block py-3 rounded-xl text-sm font-semibold text-center border transition-all" style={{ borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)' }}>Get Directions →</a>
      </Sheet>
    );
  }

  if (style === 'directions') {
    const steps = [
      venue.address && { icon: '📍', label: 'Location', text: fullAddress, href: undefined },
      venue.phone && { icon: '📞', label: 'Call ahead', text: venue.phone, href: `tel:${venue.phone}` },
      { icon: '🗺', label: 'Directions', text: 'Open in Google Maps', href: mapUrl },
    ].filter(Boolean) as { icon: string; label: string; text: string; href?: string }[];
    return (
      <Sheet onClose={onClose} title="How to find us">
        <div className="space-y-3">
          {steps.map((step, i) => {
            const inner = (
              <div className="flex items-start gap-3 rounded-xl p-4 border direction-step"
                style={{ background: 'color-mix(in srgb, var(--brand-accent) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--brand-accent)', color: 'var(--brand-bg)' }}>{i + 1}</div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'var(--brand-accent)' }}>{step.label}</div>
                  <div className="text-sm" style={{ color: 'var(--brand-text)' }}>{step.text}</div>
                </div>
                <span className="text-xl">{step.icon}</span>
              </div>
            );
            return step.href
              ? <a key={i} href={step.href} target={step.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="block">{inner}</a>
              : <div key={i}>{inner}</div>;
          })}
        </div>
      </Sheet>
    );
  }

  // ── neon (default fallback for location)
  const neonCard = { background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)', borderColor: 'var(--brand-accent)', boxShadow: '0 0 16px color-mix(in srgb, var(--brand-accent) 20%, transparent)' };
  return (
    <Sheet onClose={onClose} title="Find us">
      <div className="space-y-3">
        {venue.address && <div className="rounded-xl p-4 border neon-border" style={neonCard}><div className="text-xs uppercase tracking-widest mb-1 font-bold" style={{ color: 'var(--brand-accent)' }}>📍 ADDRESS</div><div className="text-sm font-medium" style={{ color: 'var(--brand-text)' }}>{fullAddress}</div></div>}
        {venue.phone && (
          <a href={`tel:${venue.phone}`} className="flex items-center justify-between rounded-xl p-4 border w-full neon-border" style={neonCard}>
            <div><div className="text-xs uppercase tracking-widest mb-0.5 font-bold" style={{ color: 'var(--brand-accent)' }}>📞 PHONE</div><div className="text-sm font-medium" style={{ color: 'var(--brand-text)' }}>{venue.phone}</div></div>
            <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: 'var(--brand-accent)', color: 'var(--brand-bg)' }}>CALL</span>
          </a>
        )}
        {venue.email && <div className="rounded-xl p-4 border neon-border" style={neonCard}><div className="text-xs uppercase tracking-widest mb-0.5 font-bold" style={{ color: 'var(--brand-accent)' }}>✉️ EMAIL</div><div className="text-sm font-medium" style={{ color: 'var(--brand-text)' }}>{venue.email}</div></div>}
      </div>
    </Sheet>
  );
}

// ── Sheet components ───────────────────────────────────
function Sheet({ onClose, title, children }: { onClose: () => void; title?: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ maxWidth: 448, margin: '0 auto' }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full rounded-t-2xl border-t overflow-y-auto max-h-[85vh]"
        style={{ background: 'var(--brand-bg)', borderColor: 'color-mix(in srgb, var(--brand-accent) 20%, transparent)' }}>
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1" style={{ background: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)' }} />
        {title && (
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{title}</h3>
            <button onClick={onClose} style={{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }}><X size={18} /></button>
          </div>
        )}
        <div className="px-5 pb-8 pt-2">{children}</div>
      </div>
    </div>
  );
}

function FullSheet({ onClose, children, noPadding }: { onClose: () => void; children: React.ReactNode; noPadding?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ maxWidth: 448, margin: '0 auto', background: 'var(--brand-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
        <button onClick={onClose} style={{ color: 'var(--brand-accent)' }} className="text-sm">← Back</button>
      </div>
      <div className={`flex-1 overflow-y-auto pb-24 ${noPadding ? '' : 'px-4 py-4'}`}>{children}</div>
    </div>
  );
}
