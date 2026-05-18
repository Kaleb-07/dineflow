import { useEffect, useState, useCallback, useRef } from 'react'
import { useStore } from '../store/useStore'
import { applyTheme } from '../hooks/useTheme'
import {
  Check, Loader2, ExternalLink, Monitor,
  Smartphone, RefreshCw, Search, X
} from 'lucide-react'
import api from '../lib/axios'
import type { Theme } from '../types'

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────

const PRESETS: { name: string; color: string; theme: Partial<Theme> }[] = [
  { name: 'Luxury Dark',   color: '#c9a84c', theme: { bgColor: '#0d1f1a', accentColor: '#c9a84c', cardColor: '#122219', textColor: '#e8e0d0', fontDisplay: 'Cormorant Garamond', fontBody: 'DM Sans',         borderRadius: 10, cardStyle: 'default',  categoryStyle: 'pills'   } },
  { name: 'Bistro Warm',   color: '#e87c3e', theme: { bgColor: '#1a1008', accentColor: '#e87c3e', cardColor: '#251808', textColor: '#f0e8d8', fontDisplay: 'Playfair Display',   fontBody: 'Outfit',          borderRadius: 8,  cardStyle: 'imageTop', categoryStyle: 'tabs'    } },
  { name: 'Ocean Fresh',   color: '#3eb8a0', theme: { bgColor: '#061828', accentColor: '#3eb8a0', cardColor: '#0a2236', textColor: '#d8f0ee', fontDisplay: 'Plus Jakarta Sans',  fontBody: 'DM Sans',         borderRadius: 12, cardStyle: 'compact',  categoryStyle: 'pills'   } },
  { name: 'Minimal Light', color: '#2d2416', theme: { bgColor: '#f8f5ef', accentColor: '#2d2416', cardColor: '#ffffff', textColor: '#1a1510', fontDisplay: 'Cormorant Garamond', fontBody: 'DM Sans',         borderRadius: 6,  cardStyle: 'minimal',  categoryStyle: 'tabs'    } },
  { name: 'Bold Red',      color: '#e84c4c', theme: { bgColor: '#1a0808', accentColor: '#e84c4c', cardColor: '#240a0a', textColor: '#f5e8e8', fontDisplay: 'Outfit',             fontBody: 'Outfit',          borderRadius: 4,  cardStyle: 'bold',     categoryStyle: 'pills'   } },
  { name: 'Midnight Blue', color: '#6c8ebf', theme: { bgColor: '#08111f', accentColor: '#6c8ebf', cardColor: '#0d1a2e', textColor: '#dce8f5', fontDisplay: 'Libre Baskerville',  fontBody: 'Plus Jakarta Sans', borderRadius: 14, cardStyle: 'default',  categoryStyle: 'icons'   } },
]

// Popular Google Fonts — each loads via @import in the preview
const GOOGLE_FONTS: { label: string; value: string; category: string }[] = [
  // Serif
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond', category: 'Serif'      },
  { label: 'Playfair Display',   value: 'Playfair Display',   category: 'Serif'      },
  { label: 'Libre Baskerville',  value: 'Libre Baskerville',  category: 'Serif'      },
  { label: 'Lora',               value: 'Lora',               category: 'Serif'      },
  { label: 'Merriweather',       value: 'Merriweather',       category: 'Serif'      },
  { label: 'EB Garamond',        value: 'EB Garamond',        category: 'Serif'      },
  { label: 'Crimson Pro',        value: 'Crimson Pro',        category: 'Serif'      },
  { label: 'Source Serif 4',     value: 'Source Serif 4',     category: 'Serif'      },
  { label: 'Spectral',           value: 'Spectral',           category: 'Serif'      },
  { label: 'Gilda Display',      value: 'Gilda Display',      category: 'Serif'      },
  // Sans-serif
  { label: 'DM Sans',            value: 'DM Sans',            category: 'Sans-serif' },
  { label: 'Outfit',             value: 'Outfit',             category: 'Sans-serif' },
  { label: 'Plus Jakarta Sans',  value: 'Plus Jakarta Sans',  category: 'Sans-serif' },
  { label: 'Inter',              value: 'Inter',              category: 'Sans-serif' },
  { label: 'Nunito',             value: 'Nunito',             category: 'Sans-serif' },
  { label: 'Poppins',            value: 'Poppins',            category: 'Sans-serif' },
  { label: 'Raleway',            value: 'Raleway',            category: 'Sans-serif' },
  { label: 'Josefin Sans',       value: 'Josefin Sans',       category: 'Sans-serif' },
  { label: 'Montserrat',         value: 'Montserrat',         category: 'Sans-serif' },
  { label: 'Urbanist',           value: 'Urbanist',           category: 'Sans-serif' },
  { label: 'Lexend',             value: 'Lexend',             category: 'Sans-serif' },
  { label: 'Sora',               value: 'Sora',               category: 'Sans-serif' },
  // Display
  { label: 'Bebas Neue',         value: 'Bebas Neue',         category: 'Display'    },
  { label: 'Righteous',          value: 'Righteous',          category: 'Display'    },
  { label: 'Abril Fatface',      value: 'Abril Fatface',      category: 'Display'    },
  { label: 'Cinzel',             value: 'Cinzel',             category: 'Display'    },
  { label: 'Philosopher',        value: 'Philosopher',        category: 'Display'    },
  { label: 'Italiana',           value: 'Italiana',           category: 'Display'    },
  { label: 'Tenor Sans',         value: 'Tenor Sans',         category: 'Display'    },
  // Handwriting
  { label: 'Dancing Script',     value: 'Dancing Script',     category: 'Handwriting'},
  { label: 'Pacifico',           value: 'Pacifico',           category: 'Handwriting'},
  { label: 'Sacramento',         value: 'Sacramento',         category: 'Handwriting'},
]

// Card style options
const CARD_STYLES: { id: string; label: string; desc: string; icon: string }[] = [
  { id: 'default',  label: 'Classic',    desc: 'Image left, text right',    icon: '▤'  },
  { id: 'compact',  label: 'Compact',    desc: 'No image, text only',        icon: '≡'  },
  { id: 'imageTop', label: 'Image top',  desc: 'Image on top, text below',   icon: '⊟'  },
  { id: 'minimal',  label: 'Minimal',    desc: 'Just name + price, no desc', icon: '—'  },
  { id: 'bold',     label: 'Bold',       desc: 'Large text, strong accent',  icon: '◼'  },
]

// Category display styles
const CATEGORY_STYLES: { id: string; label: string; icon: string }[] = [
  { id: 'pills',   label: 'Pills',   icon: '💊' },
  { id: 'tabs',    label: 'Tabs',    icon: '📑' },
  { id: 'icons',   label: 'Icons',   icon: '🔵' },
  { id: 'sidebar', label: 'Sidebar', icon: '☰'  },
]

// Menu layout
const MENU_LAYOUTS: { id: string; label: string; icon: string }[] = [
  { id: 'list', label: 'List',  icon: '☰' },
  { id: 'grid', label: 'Grid',  icon: '⊞' },
]

// Image shapes
const IMAGE_SHAPES: { id: string; label: string }[] = [
  { id: 'rounded', label: 'Rounded' },
  { id: 'circle',  label: 'Circle'  },
  { id: 'square',  label: 'Square'  },
]

// Price position
const PRICE_POSITIONS: { id: string; label: string }[] = [
  { id: 'bottom', label: 'Below name'  },
  { id: 'right',  label: 'Right side'  },
  { id: 'badge',  label: 'Badge style' },
]

// Drink section style
const DRINK_STYLES: { id: string; label: string; desc: string }[] = [
  { id: 'same',   label: 'Same as food', desc: 'Unified look'          },
  { id: 'dark',   label: 'Darker cards', desc: 'Richer, bar-like feel' },
  { id: 'light',  label: 'Lighter',      desc: 'Airy, fresh feel'      },
  { id: 'accent', label: 'Accent tinted',desc: 'Cards tinted with brand color' },
]

const DEFAULTS: Required<Theme> = {
  id: 0, venueId: 0,
  bgColor: '#0d1f1a', accentColor: '#c9a84c', cardColor: '#122219', textColor: '#e8e0d0',
  fontDisplay: 'Cormorant Garamond', fontBody: 'DM Sans',
  borderRadius: 10, cardPadding: 10, itemGap: 8,
  showImages: true, showPrice: true, showMealTabs: true, showDesc: true,
  cardStyle: 'default', menuLayout: 'list', categoryStyle: 'pills',
  polygonVariant: 'hexagon',
  drinkStyle: 'same', showAllergens: false, showBadges: true,
  imageShape: 'rounded', pricePosition: 'bottom',
  // Animation controls
  animateItems: false,
  animateHover: false,
  hoverStyle: 'lift',
  animatePrice: false,
  animateCategories: false,
  animationSpeed: 5,
}

function hexA(hex: string, a: number) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

function googleFontUrl(fonts: string[]) {
  const unique = [...new Set(fonts)].filter(Boolean)
  if (!unique.length) return ''
  const families = unique.map(f => `family=${encodeURIComponent(f)}:wght@400;500;600`).join('&')
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}

// ─────────────────────────────────────────────
//  FONT PICKER COMPONENT
// ─────────────────────────────────────────────
function FontPicker({ value, onChange, label }: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const [cat,   setCat]   = useState('All')

  const categories = ['All', 'Serif', 'Sans-serif', 'Display', 'Handwriting']

  const filtered = GOOGLE_FONTS.filter(f => {
    const matchCat   = cat === 'All' || f.category === cat
    const matchQuery = f.label.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQuery
  })

  return (
    <div className="relative">
      <label style={{ color:'rgba(255,255,255,0.4)', fontSize:10, letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:5 }}>
        {label}
      </label>

      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'9px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)',
          background:'rgba(255,255,255,0.04)', cursor:'pointer',
        }}
      >
        <span style={{ fontFamily: `'${value}', serif, sans-serif`, fontSize:13, color:'rgba(255,255,255,0.85)' }}>
          {value || 'Choose font…'}
        </span>
        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:10 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, right:0, zIndex:999,
          background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:12, boxShadow:'0 16px 40px rgba(0,0,0,0.6)',
          overflow:'hidden',
        }}>
          {/* Search */}
          <div style={{ padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:8 }}>
            <Search size={12} color="rgba(255,255,255,0.3)" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search fonts…"
              style={{ flex:1, background:'none', border:'none', outline:'none', color:'white', fontSize:12 }}
            />
            {query && <button onClick={() => setQuery('')} style={{ color:'rgba(255,255,255,0.3)', background:'none', border:'none', cursor:'pointer' }}><X size={11} /></button>}
          </div>

          {/* Category tabs */}
          <div style={{ display:'flex', gap:4, padding:'8px 10px', borderBottom:'1px solid rgba(255,255,255,0.07)', overflowX:'auto' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding:'3px 10px', borderRadius:20, border:'1px solid',
                fontSize:10, cursor:'pointer', whiteSpace:'nowrap',
                borderColor: cat === c ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)',
                background: cat === c ? 'rgba(201,168,76,0.1)' : 'transparent',
                color: cat === c ? '#c9a84c' : 'rgba(255,255,255,0.4)',
              }}>{c}</button>
            ))}
          </div>

          {/* Font list */}
          <div style={{ maxHeight:220, overflowY:'auto', padding:'6px 6px' }}>
            {filtered.map(f => (
              <button key={f.value} onClick={() => { onChange(f.value); setOpen(false); setQuery('') }}
                style={{
                  width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'8px 10px', borderRadius:8, border:'none', cursor:'pointer',
                  background: value === f.value ? 'rgba(201,168,76,0.1)' : 'transparent',
                  textAlign:'left',
                }}
              >
                <div>
                  <div style={{ fontFamily:`'${f.value}', serif`, fontSize:14, color:'rgba(255,255,255,0.85)' }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{f.category}</div>
                </div>
                {value === f.value && <Check size={12} color="#c9a84c" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign:'center', padding:'20px 0', color:'rgba(255,255,255,0.3)', fontSize:12 }}>
                No fonts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
//  SECTION WRAPPER
// ─────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)' }}>
      <div style={{ padding:'8px 14px', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:9, fontWeight:600, letterSpacing:1.5, textTransform:'uppercase' as const, color:'rgba(255,255,255,0.3)' }}>
        {label}
      </div>
      <div style={{ padding:'14px' }}>{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  MINI CARD PREVIEW
// ─────────────────────────────────────────────
function MiniCard({ cardStyle, theme: p }: { cardStyle: string; theme: Required<Theme> }) {
  const bg     = hexA(p.accentColor, 0.08)
  const border = hexA(p.accentColor, 0.18)
  const sub    = hexA(p.textColor, 0.5)
  const accent = p.accentColor
  const r      = Math.min(p.borderRadius, 10)

  if (cardStyle === 'compact') return (
    <div style={{ background: p.cardColor, borderRadius: r, padding:'6px 10px', border:`1px solid ${border}`, minHeight:44, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div>
        <div style={{ fontFamily:`'${p.fontDisplay}'`, fontSize:10, fontWeight:600, color:p.textColor }}>Timatim Eggs</div>
        <div style={{ fontSize:8, color:sub, marginTop:1 }}>Spiced tomato sauce</div>
      </div>
      <div style={{ fontSize:9, fontWeight:700, color:accent }}>85 ETB</div>
    </div>
  )

  if (cardStyle === 'imageTop') return (
    <div style={{ background: p.cardColor, borderRadius: r, border:`1px solid ${border}`, overflow:'hidden' }}>
      <div style={{ height:36, background: bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🍳</div>
      <div style={{ padding:'5px 8px' }}>
        <div style={{ fontFamily:`'${p.fontDisplay}'`, fontSize:10, fontWeight:600, color:p.textColor }}>Timatim Eggs</div>
        <div style={{ fontSize:9, fontWeight:700, color:accent, marginTop:2 }}>85 ETB</div>
      </div>
    </div>
  )

  if (cardStyle === 'minimal') return (
    <div style={{ borderBottom:`1px solid ${border}`, padding:'7px 0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ fontFamily:`'${p.fontDisplay}'`, fontSize:11, color:p.textColor }}>Timatim Firfir Eggs</div>
      <div style={{ fontSize:9, color:accent, fontWeight:600 }}>85 ETB</div>
    </div>
  )

  if (cardStyle === 'bold') return (
    <div style={{ background:accent, borderRadius: r, padding:'8px 10px' }}>
      <div style={{ fontFamily:`'${p.fontDisplay}'`, fontSize:11, fontWeight:700, color:p.bgColor }}>Timatim Eggs</div>
      <div style={{ fontSize:9, color:hexA(p.bgColor, 0.7), marginTop:1 }}>Spiced tomato sauce</div>
      <div style={{ fontSize:9, fontWeight:700, color:p.bgColor, marginTop:3 }}>85 ETB</div>
    </div>
  )

  // default
  return (
    <div style={{ display:'flex', gap:8, background: p.cardColor, borderRadius: r, padding:'8px', border:`1px solid ${border}` }}>
      <div style={{ width:40, height:40, borderRadius: Math.max(0,r-2), background: bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🍳</div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:`'${p.fontDisplay}'`, fontSize:10, fontWeight:600, color:p.textColor }}>Timatim Eggs</div>
        <div style={{ fontSize:8, color:sub, marginTop:1 }}>Spiced tomato sauce</div>
        <div style={{ fontSize:9, fontWeight:700, color:accent, marginTop:3 }}>85 ETB</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────
export default function ThemePage() {
  const { venue, setTheme: setStoreTheme } = useStore()
  const [theme,        setTheme]        = useState<Required<Theme>>({ ...DEFAULTS })
  const [activePreset, setActivePreset] = useState('Luxury Dark')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [previewSize,  setPreviewSize]  = useState<'phone' | 'desktop'>('phone')
  const [iframeReady,  setIframeReady]  = useState(false)
  const iframeRef  = useRef<HTMLIFrameElement>(null)
  const themeRef   = useRef(theme)
  themeRef.current = theme

  // Inject Google Fonts for current selection
  useEffect(() => {
    const id  = 'gf-theme-page'
    let el    = document.getElementById(id) as HTMLLinkElement | null
    if (!el) { el = document.createElement('link'); el.id = id; el.rel = 'stylesheet'; document.head.appendChild(el) }
    el.href = googleFontUrl([theme.fontDisplay, theme.fontBody])
  }, [theme.fontDisplay, theme.fontBody])

  // Lock admin layout scroll
  useEffect(() => {
    const main = document.querySelector('main') as HTMLElement | null
    if (main) { main.style.overflow = 'hidden'; main.style.padding = '16px' }
    return () => { if (main) { main.style.overflow = ''; main.style.padding = '' } }
  }, [])

  // Load saved theme
  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      if (data?.theme) {
        const merged = { ...DEFAULTS, ...data.theme }
        setTheme(merged)
        applyTheme(merged)
      }
    })
  }, [])

  const pushTheme = useCallback((t: Required<Theme>) => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'DINEFLOW_THEME', theme: t }, '*')
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'DINEFLOW_READY') {
        setIframeReady(true)
        pushTheme(themeRef.current)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [pushTheme])

  useEffect(() => { if (iframeReady) pushTheme(theme) }, [theme, iframeReady, pushTheme])

  const update = useCallback((patch: Partial<Theme>) => {
    setTheme(prev => {
      const next = { ...prev, ...patch } as Required<Theme>
      applyTheme(next)
      return next
    })
    setActivePreset('')
  }, [])

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const next = { ...theme, ...preset.theme } as Required<Theme>
    setTheme(next); applyTheme(next); setActivePreset(preset.name)
  }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/settings/theme', theme)
      setStoreTheme(data); setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  const reloadIframe = () => {
    setIframeReady(false)
    if (iframeRef.current) iframeRef.current.src += ''
  }

  const guestUrl = venue?.slug ? `${window.location.origin}/menu/${venue.slug}` : null
  const ac = theme.accentColor

  return (
    <div style={{ display:'flex', gap:20, height:'calc(100vh - 90px)', overflow:'hidden' }}>

      {/* ═══════════════════════════════════════
          LEFT — scrollable controls
      ═══════════════════════════════════════ */}
      <div style={{
        width:310, flexShrink:0, overflowY:'auto',
        display:'flex', flexDirection:'column', gap:12,
        paddingRight:4, scrollbarWidth:'thin',
        scrollbarColor:'rgba(255,255,255,0.08) transparent',
      }}>

        {/* Header + save */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <div style={{ color:'white', fontWeight:600, fontSize:16 }}>Branding</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:2 }}>All changes push to guest menu live</div>
          </div>
          <button onClick={save} disabled={saving} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:600,
            border: saved ? '1px solid #4ade80' : 'none',
            background: saved ? 'rgba(74,222,128,0.1)' : ac,
            color: saved ? '#4ade80' : theme.bgColor,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}>
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
            : saved  ? <><Check size={13} /> Published!</>
            : 'Save & publish'}
          </button>
        </div>

        {/* ── 1. PRESETS ── */}
        <Section label="Quick presets">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {PRESETS.map(p => (
              <button key={p.name} onClick={() => applyPreset(p)} style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                padding:'10px 6px', borderRadius:10, border:'1px solid',
                borderColor: activePreset === p.name ? p.color+'66' : 'rgba(255,255,255,0.07)',
                background:  activePreset === p.name ? p.color+'14' : 'rgba(255,255,255,0.02)',
                cursor:'pointer', position:'relative',
              }}>
                {activePreset === p.name && (
                  <div style={{ position:'absolute', top:4, right:4, width:12, height:12, borderRadius:'50%', background:p.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Check size={7} color="#000" strokeWidth={3} />
                  </div>
                )}
                <div style={{ display:'flex', gap:3 }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background: p.theme.bgColor, border:'1px solid rgba(255,255,255,0.15)' }} />
                  <div style={{ width:12, height:12, borderRadius:'50%', background: p.color }} />
                </div>
                <span style={{ fontSize:9, textAlign:'center', lineHeight:1.2, color: activePreset===p.name ? p.color : 'rgba(255,255,255,0.45)' }}>
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── 2. COLORS ── */}
        <Section label="Colors">
          {[
            { label:'Background',     key:'bgColor'     },
            { label:'Accent / brand', key:'accentColor' },
            { label:'Card',           key:'cardColor'   },
            { label:'Text',           key:'textColor'   },
          ].map(({ label, key }) => (
            <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:10, marginBottom:10, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:20, height:20, borderRadius:5, background:(theme as any)[key], border:'1px solid rgba(255,255,255,0.12)' }} />
                <span style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>{label}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:10, fontFamily:'monospace', color:'rgba(255,255,255,0.25)' }}>{(theme as any)[key]}</span>
                <label style={{ position:'relative', cursor:'pointer' }}>
                  <div style={{ width:28, height:28, borderRadius:7, overflow:'hidden', background:(theme as any)[key], border:'1px solid rgba(255,255,255,0.12)' }}>
                    <input type="color" value={(theme as any)[key]}
                      onChange={e => update({ [key]: e.target.value } as any)}
                      style={{ position:'absolute', inset:-4, width:'calc(100% + 8px)', height:'calc(100% + 8px)', opacity:0, cursor:'pointer' }} />
                  </div>
                </label>
              </div>
            </div>
          ))}
        </Section>

        {/* ── 3. TYPOGRAPHY — Google Fonts picker ── */}
        <Section label="Typography">
          <FontPicker
            label="Heading font"
            value={theme.fontDisplay}
            onChange={v => update({ fontDisplay: v })}
          />
          <div style={{ marginTop:12 }}>
            <FontPicker
              label="Body font"
              value={theme.fontBody}
              onChange={v => update({ fontBody: v })}
            />
          </div>
          {/* Live font preview */}
          <div style={{ marginTop:12, padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontFamily:`'${theme.fontDisplay}', serif`, fontSize:16, color:'rgba(255,255,255,0.8)', marginBottom:3 }}>
              Bella Vista Café
            </div>
            <div style={{ fontFamily:`'${theme.fontBody}', sans-serif`, fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>
              Fine dining · Addis Ababa<br />
              Breakfast · Lunch · Dinner
            </div>
          </div>
        </Section>

        {/* ── 4. CARD STYLE ── */}
        <Section label="Card style">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
            {CARD_STYLES.map(s => (
              <button key={s.id} onClick={() => update({ cardStyle: s.id as any })} style={{
                padding:'10px 10px 8px', borderRadius:10, border:'1px solid',
                borderColor: theme.cardStyle===s.id ? hexA(ac,0.5) : 'rgba(255,255,255,0.07)',
                background:  theme.cardStyle===s.id ? hexA(ac,0.08) : 'rgba(255,255,255,0.02)',
                cursor:'pointer', textAlign:'left',
              }}>
                <div style={{ fontSize:16, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontSize:11, fontWeight:600, color: theme.cardStyle===s.id ? ac : 'rgba(255,255,255,0.7)' }}>{s.label}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{s.desc}</div>
              </button>
            ))}
          </div>
          {/* Live mini card preview */}
          <div style={{ padding:'10px', background:'rgba(255,255,255,0.03)', borderRadius:8, border:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginBottom:6, textTransform:'uppercase', letterSpacing:1 }}>Preview</div>
            <MiniCard cardStyle={theme.cardStyle} theme={theme} />
          </div>
        </Section>

        {/* ── 5. MENU LAYOUT ── */}
        <Section label="Menu layout">
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            {MENU_LAYOUTS.map(l => (
              <button key={l.id} onClick={() => update({ menuLayout: l.id as any })} style={{
                flex:1, padding:'8px', borderRadius:8, border:'1px solid',
                borderColor: theme.menuLayout===l.id ? hexA(ac,0.5) : 'rgba(255,255,255,0.07)',
                background:  theme.menuLayout===l.id ? hexA(ac,0.08) : 'rgba(255,255,255,0.02)',
                cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              }}>
                <span style={{ fontSize:18 }}>{l.icon}</span>
                <span style={{ fontSize:10, color: theme.menuLayout===l.id ? ac : 'rgba(255,255,255,0.5)' }}>{l.label}</span>
              </button>
            ))}
          </div>

          {/* Image shape */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Image shape</div>
            <div style={{ display:'flex', gap:6 }}>
              {IMAGE_SHAPES.map(s => (
                <button key={s.id} onClick={() => update({ imageShape: s.id as any })} style={{
                  flex:1, padding:'6px', borderRadius:8, border:'1px solid', fontSize:10,
                  borderColor: theme.imageShape===s.id ? hexA(ac,0.5) : 'rgba(255,255,255,0.07)',
                  background:  theme.imageShape===s.id ? hexA(ac,0.08) : 'transparent',
                  color: theme.imageShape===s.id ? ac : 'rgba(255,255,255,0.5)',
                  cursor:'pointer',
                }}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Price position */}
          <div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:1, textTransform:'uppercase', marginBottom:6 }}>Price position</div>
            <div style={{ display:'flex', gap:6 }}>
              {PRICE_POSITIONS.map(s => (
                <button key={s.id} onClick={() => update({ pricePosition: s.id as any })} style={{
                  flex:1, padding:'6px 4px', borderRadius:8, border:'1px solid', fontSize:9,
                  borderColor: theme.pricePosition===s.id ? hexA(ac,0.5) : 'rgba(255,255,255,0.07)',
                  background:  theme.pricePosition===s.id ? hexA(ac,0.08) : 'transparent',
                  color: theme.pricePosition===s.id ? ac : 'rgba(255,255,255,0.5)',
                  cursor:'pointer', textAlign:'center' as const,
                }}>{s.label}</button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 6. CATEGORY STYLE ── */}
        <Section label="Category navigation">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {CATEGORY_STYLES.map(s => (
              <button key={s.id} onClick={() => update({ categoryStyle: s.id as any })} style={{
                padding:'10px', borderRadius:10, border:'1px solid',
                borderColor: theme.categoryStyle===s.id ? hexA(ac,0.5) : 'rgba(255,255,255,0.07)',
                background:  theme.categoryStyle===s.id ? hexA(ac,0.08) : 'rgba(255,255,255,0.02)',
                cursor:'pointer', display:'flex', alignItems:'center', gap:8,
              }}>
                <span style={{ fontSize:16 }}>{s.icon}</span>
                <span style={{ fontSize:11, fontWeight:500, color: theme.categoryStyle===s.id ? ac : 'rgba(255,255,255,0.6)' }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── 7. DRINK SECTION STYLE ── */}
        <Section label="Drink section style">
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {DRINK_STYLES.map(s => (
              <button key={s.id} onClick={() => update({ drinkStyle: s.id as any })} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'9px 12px', borderRadius:10, border:'1px solid',
                borderColor: theme.drinkStyle===s.id ? hexA(ac,0.5) : 'rgba(255,255,255,0.07)',
                background:  theme.drinkStyle===s.id ? hexA(ac,0.08) : 'rgba(255,255,255,0.02)',
                cursor:'pointer',
              }}>
                <div style={{ textAlign:'left' as const }}>
                  <div style={{ fontSize:11, fontWeight:500, color: theme.drinkStyle===s.id ? ac : 'rgba(255,255,255,0.7)' }}>{s.label}</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginTop:1 }}>{s.desc}</div>
                </div>
                {theme.drinkStyle===s.id && <Check size={13} color={ac} />}
              </button>
            ))}
          </div>
        </Section>

        {/* ── 8. SHAPE & SPACING ── */}
        <Section label="Shape & spacing">
          {[
            { label:'Corner radius', key:'borderRadius', min:0,  max:24 },
            { label:'Card padding',  key:'cardPadding',  min:4,  max:20 },
            { label:'Item gap',      key:'itemGap',      min:2,  max:16 },
          ].map(({ label, key, min, max }) => (
            <div key={key} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>{label}</span>
                <span style={{ color:ac, fontSize:11, fontFamily:'monospace' }}>{(theme as any)[key]}px</span>
              </div>
              <input type="range" min={min} max={max} value={(theme as any)[key]}
                onChange={e => update({ [key]: Number(e.target.value) } as any)}
                style={{
                  width:'100%', height:4, borderRadius:2,
                  appearance:'none' as any, cursor:'pointer',
                  background:`linear-gradient(to right, ${ac} ${((Number((theme as any)[key])-min)/(max-min))*100}%, rgba(255,255,255,0.1) ${((Number((theme as any)[key])-min)/(max-min))*100}%)`,
                }} />
            </div>
          ))}
        </Section>

        {/* ── 9. FEATURE TOGGLES ── */}
        <Section label="Show / hide features">
          {[
            { label:'Item images',    key:'showImages'   },
            { label:'Prices',         key:'showPrice'    },
            { label:'Meal-time tabs', key:'showMealTabs' },
            { label:'Descriptions',   key:'showDesc'     },
            { label:'Allergen info',  key:'showAllergens'},
            { label:'Feature badges', key:'showBadges'   },
          ].map(({ label, key }) => (
            <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>{label}</span>
              <button onClick={() => update({ [key]: !(theme as any)[key] } as any)} style={{
                width:40, height:22, borderRadius:11, border:'none',
                background:(theme as any)[key] ? ac : 'rgba(255,255,255,0.1)',
                position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0,
              }}>
                <div style={{
                  position:'absolute', top:2, width:18, height:18, borderRadius:'50%',
                  background:'white', transition:'transform .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.3)',
                  transform:(theme as any)[key] ? 'translateX(20px)' : 'translateX(2px)',
                }} />
              </button>
            </div>
          ))}
        </Section>

        {/* ── 10. ANIMATION CONTROLS ── */}
        <Section label="Animations & effects">
          {/* Animation speed slider */}
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>Animation speed</span>
              <span style={{ color:ac, fontSize:11, fontFamily:'monospace' }}>
                {theme.animationSpeed === 1 ? 'Slowest' :
                 theme.animationSpeed === 2 ? 'Very Slow' :
                 theme.animationSpeed === 3 ? 'Slow' :
                 theme.animationSpeed === 4 ? 'Moderate' :
                 theme.animationSpeed === 5 ? 'Normal' :
                 theme.animationSpeed === 6 ? 'Quick' :
                 theme.animationSpeed === 7 ? 'Fast' :
                 theme.animationSpeed === 8 ? 'Very Fast' :
                 theme.animationSpeed === 9 ? 'Rapid' :
                 theme.animationSpeed === 10 ? 'Instant' : 'Normal'}
              </span>
            </div>
            <input type="range" min={1} max={10} value={theme.animationSpeed}
              onChange={e => update({ animationSpeed: Number(e.target.value) })}
              style={{
                width:'100%', height:4, borderRadius:2,
                appearance:'none' as any, cursor:'pointer',
                background:`linear-gradient(to right, ${ac} ${((theme.animationSpeed-1)/9)*100}%, rgba(255,255,255,0.1) ${((theme.animationSpeed-1)/9)*100}%)`,
              }} />
          </div>

          {/* Animation toggles */}
          {[
            { label:'Item entrance animations', key:'animateItems',      desc:'Staggered fade-in effect' },
            { label:'Price shimmer',            key:'animatePrice',      desc:'Subtle shine effect' },
            { label:'Category animations',      key:'animateCategories', desc:'Ripple & transitions' },
          ].map(({ label, key, desc }) => (
            <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>{label}</div>
                <div style={{ color:'rgba(255,255,255,0.3)', fontSize:9, marginTop:1 }}>{desc}</div>
              </div>
              <button onClick={() => update({ [key]: !(theme as any)[key] } as any)} style={{
                width:40, height:22, borderRadius:11, border:'none',
                background:(theme as any)[key] === true ? ac : 'rgba(255,255,255,0.1)',
                position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0,
              }}>
                <div style={{
                  position:'absolute', top:2, width:18, height:18, borderRadius:'50%',
                  background:'white', transition:'transform .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.3)',
                  transform:(theme as any)[key] === true ? 'translateX(20px)' : 'translateX(2px)',
                }} />
              </button>
            </div>
          ))}

          {/* Hover effects with style selector */}
          <div style={{ padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div>
                <div style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>Hover effects</div>
                <div style={{ color:'rgba(255,255,255,0.3)', fontSize:9, marginTop:1 }}>Interactive animations on hover</div>
              </div>
              <button onClick={() => update({ animateHover: !theme.animateHover })} style={{
                width:40, height:22, borderRadius:11, border:'none',
                background:theme.animateHover === true ? ac : 'rgba(255,255,255,0.1)',
                position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0,
              }}>
                <div style={{
                  position:'absolute', top:2, width:18, height:18, borderRadius:'50%',
                  background:'white', transition:'transform .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.3)',
                  transform:theme.animateHover === true ? 'translateX(20px)' : 'translateX(2px)',
                }} />
              </button>
            </div>

            {/* Hover style selector - only visible when hover is enabled */}
            {theme.animateHover && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>Hover style</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {([
                    { value: 'lift', label: 'Lift', icon: '↑', desc: 'Lift & scale' },
                    { value: 'glow', label: 'Glow', icon: '✨', desc: 'Glowing shadow' },
                    { value: 'tilt', label: 'Tilt', icon: '⤸', desc: '3D tilt effect' },
                    { value: 'zoom', label: 'Zoom', icon: '🔍', desc: 'Zoom in' },
                    { value: 'bounce', label: 'Bounce', icon: '⤴', desc: 'Bounce effect' },
                    { value: 'rotate', label: 'Rotate', icon: '↻', desc: 'Slight rotation' },
                    { value: 'slide', label: 'Slide', icon: '→', desc: 'Slide up' },
                    { value: 'flip', label: 'Flip', icon: '⟲', desc: 'Flip animation' },
                    { value: 'pulse', label: 'Pulse', icon: '◉', desc: 'Pulse scale' },
                    { value: 'shake', label: 'Shake', icon: '⚡', desc: 'Shake effect' },
                    { value: 'bgLeft', label: 'BG Left→Right', icon: '→', desc: 'Color sweeps left to right' },
                    { value: 'bgRight', label: 'BG Right→Left', icon: '←', desc: 'Color sweeps right to left' },
                    { value: 'bgCenter', label: 'BG Center Out', icon: '↔', desc: 'Expands from center' },
                    { value: 'bgCorners', label: 'BG Corners', icon: '⤢', desc: 'Radiates from corners' },
                    { value: 'bgDiagonal', label: 'BG Diagonal', icon: '⤡', desc: 'Diagonal sweep' },
                    { value: 'bgReveal', label: 'BG Reveal', icon: '▭', desc: 'Curtain reveal' },
                    { value: 'bgSplit', label: 'BG Split', icon: '⇆', desc: 'Split from sides' },
                    { value: 'bgWave', label: 'BG Wave', icon: '〰', desc: 'Wave transition' },
                  ] as const).map(style => (
                    <button key={style.value}
                      onClick={() => update({ hoverStyle: style.value })}
                      style={{
                        padding:'8px', borderRadius:8, border:'1px solid',
                        borderColor: (theme.hoverStyle || 'lift') === style.value ? hexA(ac,0.5) : 'rgba(255,255,255,0.07)',
                        background:  (theme.hoverStyle || 'lift') === style.value ? hexA(ac,0.08) : 'rgba(255,255,255,0.02)',
                        cursor:'pointer', textAlign:'left',
                      }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                        <span style={{ fontSize:14 }}>{style.icon}</span>
                        <span style={{ fontSize:10, fontWeight:500, color: (theme.hoverStyle || 'lift') === style.value ? ac : 'rgba(255,255,255,0.7)' }}>
                          {style.label}
                        </span>
                      </div>
                      <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)' }}>{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Open live menu */}
        {guestUrl && (
          <a href={guestUrl} target="_blank" rel="noreferrer" style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'10px 14px', borderRadius:10,
            border:`1px solid ${hexA(ac,0.3)}`, color:ac,
            fontSize:12, textDecoration:'none',
          }}>
            <span>Open live guest menu</span>
            <ExternalLink size={13} />
          </a>
        )}

        <div style={{ height:20 }} />
      </div>

      {/* ═══════════════════════════════════════
          RIGHT — fixed live preview (iframe)
      ═══════════════════════════════════════ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background: iframeReady ? '#4ade80' : '#f59e0b', boxShadow: iframeReady ? '0 0 6px #4ade80' : '0 0 6px #f59e0b' }} />
            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>
              {iframeReady ? 'Live — scroll, tap, interact freely' : 'Loading preview…'}
            </span>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <button onClick={reloadIframe} style={{ width:30, height:30, borderRadius:7, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <RefreshCw size={13} />
            </button>
            <div style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:3 }}>
              {([
                { id:'phone'   as const, icon:<Smartphone size={13} />, label:'Mobile'  },
                { id:'desktop' as const, icon:<Monitor size={13} />,    label:'Desktop' },
              ]).map(btn => (
                <button key={btn.id} onClick={() => setPreviewSize(btn.id)} style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'4px 10px', borderRadius:6, border:'none', fontSize:11,
                  cursor:'pointer', transition:'all .15s',
                  background: previewSize===btn.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: previewSize===btn.id ? 'white' : 'rgba(255,255,255,0.35)',
                }}>
                  {btn.icon} {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview frame */}
        <div style={{ flex:1, display:'flex', alignItems:'flex-start', justifyContent:'center', overflow:'hidden' }}>
          {!guestUrl ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, height:'100%', color:'rgba(255,255,255,0.25)', fontSize:13 }}>
              <div style={{ fontSize:32 }}>🏨</div>
              <div>Set up your venue first to see the preview</div>
            </div>
          ) : previewSize === 'phone' ? (
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ position:'absolute', inset:0, borderRadius:42, border:'8px solid #374151', boxShadow:'0 24px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)', pointerEvents:'none', zIndex:10 }} />
              <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', width:90, height:18, background:'#374151', borderRadius:9, zIndex:20, pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', width:60, height:4, background:'rgba(255,255,255,0.2)', borderRadius:2, zIndex:20, pointerEvents:'none' }} />
              <iframe ref={iframeRef} src={guestUrl} title="Guest menu live preview"
                onLoad={() => { setIframeReady(false); setTimeout(() => pushTheme(themeRef.current), 400) }}
                style={{ width:320, height:620, border:'none', borderRadius:34, display:'block', background:theme.bgColor }} />
            </div>
          ) : (
            <div style={{ width:'100%', maxWidth:720, borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 16px 48px rgba(0,0,0,0.4)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', background:'#1a1a1a', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display:'flex', gap:5 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#ef4444' }} />
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#f59e0b' }} />
                  <div style={{ width:10, height:10, borderRadius:'50%', background:'#22c55e' }} />
                </div>
                <div style={{ flex:1, background:'#111', borderRadius:6, padding:'3px 10px', fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'monospace' }}>
                  {guestUrl}
                </div>
              </div>
              <iframe ref={previewSize==='desktop' ? iframeRef : undefined} src={guestUrl} title="Guest menu desktop preview"
                onLoad={() => { setIframeReady(false); setTimeout(() => pushTheme(themeRef.current), 400) }}
                style={{ width:'100%', height:520, border:'none', display:'block', background:theme.bgColor }} />
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.18)', marginTop:8, flexShrink:0 }}>
          Scroll, tap, and interact — it's your real menu running live
        </div>
      </div>
    </div>
  )
}