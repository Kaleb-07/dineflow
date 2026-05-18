import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, X, ChevronDown } from 'lucide-react';
import { applyTheme } from '../hooks/useTheme';
import type { Venue, MenuItem, Variant, Review, Category } from '../types';
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
      // Animation defaults - all OFF
      animateItems: false,
      animateHover: false,
      animatePrice: false,
      animateCategories: false,
      animationSpeed: 5,
    });
  }, []);

  useEffect(() => {
    if (!slug) return;
    console.log('🌐 Fetching venue:', slug);
    api.get(`/public/${slug}`).then(({ data }) => {
      console.log('✅ Venue data received:', {
        id: data.id,
        name: data.name,
        slug: data.slug,
        categoriesCount: data.categories?.length,
        categories: data.categories?.map((c: Category) => ({ id: c.id, name: c.name, type: c.type, itemsCount: c.items?.length }))
      });
      setVenue(data);
      if (data.theme) applyTheme(data.theme);
      setLoading(false);
    }).catch((err) => {
      console.error('❌ Error fetching venue:', err);
      setLoading(false);
    });
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

  // Debug logging
  const debugInfo = {
    type,
    meal,
    totalCategories: venue.categories?.length,
    filteredCats: cats.length,
    activeCat,
    itemsInCategory: items.length,
    categories: cats.map((c: Category) => ({ id: c.id, name: c.name, itemCount: c.items?.length }))
  };
  console.log('🔍 Debug Info:', JSON.stringify(debugInfo, null, 2));

  return (
    <div className="guest-bg min-h-screen max-w-md mx-auto flex flex-col" style={{ fontFamily: 'var(--brand-font-body)' }}>

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
          {/* Dropdown trigger (only visible in dropdown mode) */}
          <button
            className="dropdown-trigger w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all mb-2"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'var(--brand-card)',
              borderColor: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)',
              color: 'var(--brand-text)',
              display: 'none' // Hidden by default, shown via CSS for dropdown style
            }}>
            <span className="flex items-center gap-2">
              <span className="text-lg">{cats.find(c => c.id === activeCat)?.icon}</span>
              <span className="text-sm font-medium">{cats.find(c => c.id === activeCat)?.name || 'Select category'}</span>
            </span>
            <ChevronDown 
              size={18} 
              style={{ 
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }} 
            />
          </button>

          {/* Category list */}
          <div className={`category-chips flex gap-2 overflow-x-auto pb-1 ${dropdownOpen ? 'dropdown-open' : ''}`} style={{ scrollbarWidth: 'none' }}>
            {cats.map(c => (
              <button key={c.id} 
                onClick={() => {
                  setCatId(c.id);
                  setDropdownOpen(false); // Close dropdown after selection
                }}
                className={`category-chip flex items-center flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  activeCat === c.id ? 'active' : ''
                }`}
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
      <div className="flex-1 overflow-y-auto px-4 mt-3 pb-24 space-y-2">
        {items.length === 0 && (
          <div className="text-center py-12" style={{ color: 'color-mix(in srgb, var(--brand-text) 40%, transparent)' }}>
            No items in this category
          </div>
        )}
        {items.map(i => (
          <button key={i.id} onClick={() => setItem(i)} className="w-full text-left">
            <div className="guest-card flex gap-3 border transition-all"
              style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)', marginBottom: 'var(--brand-gap)' }}>
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
                  <span className="text-sm font-medium guest-heading" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>
                    {i.name}
                  </span>
                  {i.isFeatured && (
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--brand-accent)' }}>★</span>
                  )}
                </div>
                <p className="item-desc text-xs mt-0.5 line-clamp-2"
                  style={{ color: 'color-mix(in srgb, var(--brand-text) 55%, transparent)' }}>
                  {i.description}
                </p>
                <div className="item-price text-xs font-medium mt-1.5" style={{ color: 'var(--brand-accent)' }}>
                  {i.variants.length > 0
                    ? `from ${Math.min(...i.variants.map(v => v.price))} ${venue.currency}`
                    : '—'
                  }
                </div>
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
          { id: 'menu',     label: 'Menu',     icon: '🍽' },
          { id: 'about',    label: 'About',    icon: '🏨' },
          { id: 'reviews',  label: 'Reviews',  icon: '⭐' },
          { id: 'location', label: 'Find us',  icon: '📍' },
        ] as { id: Tab; label: string; icon: string }[]).map(n => (
          <button key={n.id}
            onClick={() => n.id === 'location' ? setLocation(true) : setTab(n.id)}
            className="flex-1 flex flex-col items-center py-3 gap-0.5 transition-all">
            <span className="text-base">{n.icon}</span>
            <span className="text-xs" style={{
              color: tab === n.id ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 40%, transparent)'
            }}>
              {n.label}
            </span>
          </button>
        ))}
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
    </div>
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
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--brand-accent)' }}>
            Ingredients
          </div>
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
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--brand-accent)' }}>
            Choose size
          </div>
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
        <div className="text-center py-8" style={{ color: 'var(--brand-accent)' }}>
          ✓ Thank you for your review!
        </div>
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
                <button key={s} onClick={() => setForm(p => ({ ...p, rating: s }))}
                  className="text-2xl transition-transform hover:scale-110">
                  <span style={{ color: s <= form.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 20%, transparent)' }}>★</span>
                </button>
              ))}
            </div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--brand-accent)' }}>
              {labels[form.rating]}
            </div>
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

// ── Location modal ─────────────────────────────────────
function LocationModal({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  return (
    <Sheet onClose={onClose} title="Find us">
      <div className="space-y-3">
        <div className="rounded-xl p-4 border" style={{ background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--brand-accent)' }}>Address</div>
          <div className="text-sm" style={{ color: 'var(--brand-text)' }}>{venue.address}<br />{venue.city}, {venue.country}</div>
        </div>
        {venue.phone && (
          <a href={`tel:${venue.phone}`}
            className="flex items-center justify-between rounded-xl p-4 border w-full"
            style={{ background: 'color-mix(in srgb, var(--brand-accent) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)', color: 'var(--brand-text)' }}>
            <span className="text-sm">{venue.phone}</span>
            <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'var(--brand-accent)', color: 'var(--brand-bg)' }}>
              Call now
            </span>
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

// ── About sheet ────────────────────────────────────────
function AboutSheet({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  return (
    <FullSheet onClose={onClose}>
      {venue.coverPhoto && (
        <div className="h-40 overflow-hidden mb-4 rounded-xl">
          <img src={venue.coverPhoto} className="w-full h-full object-cover" alt="" />
        </div>
      )}
      <h2 className="text-2xl font-semibold guest-heading mb-1"
        style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>
        {venue.name}
      </h2>
      {venue.description && (
        <p className="text-sm leading-relaxed mb-5"
          style={{ color: 'color-mix(in srgb, var(--brand-text) 65%, transparent)' }}>
          {venue.description}
        </p>
      )}
      {venue.amenities && venue.amenities.length > 0 && (
        <div className="mb-5">
          <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--brand-accent)' }}>Amenities</div>
          <div className="flex flex-wrap gap-2">
            {venue.amenities.map(a => (
              <span key={a.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
                style={{ color: 'color-mix(in srgb, var(--brand-text) 70%, transparent)',
                         borderColor: 'color-mix(in srgb, var(--brand-accent) 25%, transparent)' }}>
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </FullSheet>
  );
}

// ── Reviews sheet ──────────────────────────────────────
function ReviewsSheet({ reviews, avgRating, onLeaveReview, onClose }: {
  reviews: Review[]; avgRating: string | null
  onLeaveReview: () => void; onClose: () => void
}) {
  return (
    <FullSheet onClose={onClose}>
      <div className="flex items-center gap-4 mb-5">
        <div className="text-5xl font-bold guest-heading" style={{ color: 'var(--brand-accent)', fontFamily: 'var(--brand-font-display)' }}>
          {avgRating || '—'}
        </div>
        <div>
          <div className="flex gap-0.5 mb-1">
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ color: 'var(--brand-accent)', fontSize: 12 }}>★</span>
            ))}
          </div>
          <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }}>
            {reviews.length} reviews
          </div>
        </div>
      </div>
      <button onClick={onLeaveReview}
        className="w-full py-2.5 rounded-xl text-sm font-medium border mb-5 transition-all"
        style={{ borderColor: 'var(--brand-accent)', color: 'var(--brand-accent)' }}>
        Share your experience
      </button>
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="rounded-xl p-3 border"
            style={{ background: 'color-mix(in srgb, var(--brand-accent) 4%, transparent)',
                     borderColor: 'color-mix(in srgb, var(--brand-accent) 12%, transparent)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: 'var(--brand-text)' }}>
                {r.guestName || 'Guest'}
              </span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= r.rating ? 'var(--brand-accent)' : 'color-mix(in srgb, var(--brand-text) 20%, transparent)', fontSize: 10 }}>★</span>
                ))}
              </div>
            </div>
            {r.comment && (
              <p className="text-xs leading-relaxed" style={{ color: 'color-mix(in srgb, var(--brand-text) 60%, transparent)' }}>
                {r.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </FullSheet>
  );
}

// ── Sheet components ───────────────────────────────────
function Sheet({ onClose, title, children }: { onClose: () => void; title?: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ maxWidth: 448, margin: '0 auto' }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full rounded-t-2xl border-t overflow-y-auto max-h-[85vh]"
        style={{ background: 'var(--brand-bg)', borderColor: 'color-mix(in srgb, var(--brand-accent) 20%, transparent)' }}>
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-1"
          style={{ background: 'color-mix(in srgb, var(--brand-accent) 30%, transparent)' }} />
        {title && (
          <div className="flex items-center justify-between px-5 pt-3 pb-2">
            <h3 className="font-semibold guest-heading" style={{ fontFamily: 'var(--brand-font-display)', color: 'var(--brand-text)' }}>{title}</h3>
            <button onClick={onClose} style={{ color: 'color-mix(in srgb, var(--brand-text) 50%, transparent)' }}><X size={18} /></button>
          </div>
        )}
        <div className="px-5 pb-8 pt-2">{children}</div>
      </div>
    </div>
  );
}

function FullSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ maxWidth: 448, margin: '0 auto', background: 'var(--brand-bg)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'color-mix(in srgb, var(--brand-accent) 15%, transparent)' }}>
        <button onClick={onClose} style={{ color: 'var(--brand-accent)' }} className="text-sm">← Back</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">{children}</div>
    </div>
  );
}
