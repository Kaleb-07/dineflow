//  Paste into ThemePage controls panel
//  Usage: <AnimationsSection theme={theme} update={update} />
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { Theme } from '../types'

// ── Data ─────────────────────────────────────────────────────

const ENTRANCE_STYLES = [
  { id: 'fade-up',     icon: '↑',  label: 'Fade Up',      desc: 'Elegant upward reveal'      },
  { id: 'fade-down',   icon: '↓',  label: 'Fade Down',    desc: 'Drops in from above'         },
  { id: 'fade-left',   icon: '←',  label: 'Fade Left',    desc: 'Slides from right'           },
  { id: 'fade-right',  icon: '→',  label: 'Fade Right',   desc: 'Slides from left'            },
  { id: 'scale-up',    icon: '⊕',  label: 'Scale Up',     desc: 'Grows from small'            },
  { id: 'scale-down',  icon: '⊖',  label: 'Scale Down',   desc: 'Shrinks in from large'       },
  { id: 'flip',        icon: '⟲',  label: 'Flip',         desc: '3D perspective flip'         },
  { id: 'rotate',      icon: '↻',  label: 'Rotate',       desc: 'Spins in from angle'         },
  { id: 'blur',        icon: '◎',  label: 'Blur In',      desc: 'Focus pull from blur'        },
  { id: 'bounce',      icon: '⤴',  label: 'Bounce',       desc: 'Playful spring entry'        },
  { id: 'door',        icon: '⇹',  label: 'Slide Door',   desc: 'Alternating left-right'      },
  { id: 'wave',        icon: '〰',  label: 'Wave',         desc: 'Cascades like a wave'        },
  { id: 'none',        icon: '—',  label: 'None',         desc: 'Instant, no animation'       },
]

const PRICE_STYLES = [
  { id: 'shimmer',        icon: '✦',  label: 'Shimmer',        desc: 'Light sweep — luxury'       },
  { id: 'pulse-glow',     icon: '◉',  label: 'Pulse Glow',     desc: 'Breathing accent glow'      },
  { id: 'typewriter',     icon: '▮',  label: 'Typewriter',     desc: 'Types in from left'          },
  { id: 'flash',          icon: '⚡',  label: 'Gold Flash',     desc: 'Dramatic light burst'        },
  { id: 'wave-color',     icon: '〰',  label: 'Wave Color',     desc: 'Cycles accent shades'        },
  { id: 'bounce-scale',   icon: '⤴',  label: 'Bounce Scale',   desc: 'Rhythmic scale pulse'        },
  { id: 'underline',      icon: '＿',  label: 'Underline',      desc: 'Animated sweep underline'   },
  { id: 'neon',           icon: '🔆',  label: 'Neon Flicker',   desc: 'Electric sign flicker'       },
  { id: 'reveal',         icon: '▷',  label: 'Reveal Slide',   desc: 'Slides in on load'           },
  { id: 'stamp',          icon: '✦',  label: 'Stamp',          desc: 'Bold press-down entry'       },
  { id: 'gradient-shift', icon: '⟳',  label: 'Gradient Shift', desc: 'Slow color morph'            },
  { id: 'none',           icon: '—',  label: 'None',           desc: 'Plain accent color'          },
]

const CATEGORY_STYLES = [
  { id: 'crossfade',   icon: '⊞',  label: 'Crossfade',    desc: 'Smooth opacity blend'        },
  { id: 'slide-left',  icon: '←',  label: 'Slide Left',   desc: 'New content from right'      },
  { id: 'slide-right', icon: '→',  label: 'Slide Right',  desc: 'New content from left'       },
  { id: 'scale-fade',  icon: '⊕',  label: 'Scale Fade',   desc: 'Zooms in while fading'       },
  { id: 'flip-page',   icon: '⟲',  label: 'Flip Page',    desc: 'Newspaper page turn'         },
  { id: 'ripple',      icon: '◎',  label: 'Ripple',       desc: 'Expands from center'         },
  { id: 'wipe-up',     icon: '↑',  label: 'Wipe Up',      desc: 'Reveals from bottom'         },
  { id: 'wipe-down',   icon: '↓',  label: 'Wipe Down',    desc: 'Reveals from top'            },
  { id: 'morph',       icon: '◐',  label: 'Morph',        desc: 'Cinematic blur-in'           },
  { id: 'shutter',     icon: '▤',  label: 'Shutter',      desc: 'Venetian blind effect'       },
  { id: 'dissolve',    icon: '✦',  label: 'Dissolve',     desc: 'Pixel dissolve'              },
  { id: 'split',       icon: '⇆',  label: 'Split',        desc: 'Reveals from center'         },
  { id: 'none',        icon: '—',  label: 'None',         desc: 'Instant, no transition'      },
]

// ── Helpers ───────────────────────────────────────────────────

function hexA(hex: string, a: number) {
  if (!hex || hex.length < 7) return `rgba(120,100,60,${a})`
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

const speedLabel = (v: number) => {
  if (v <= 1) return 'Instant'
  if (v <= 3) return 'Fast'
  if (v <= 6) return 'Normal'
  if (v <= 8) return 'Relaxed'
  return 'Cinematic'
}

const speedSec = (v: number) => ((v * 0.05) + 0.05).toFixed(2) + 's'

// ── Sub-panel ─────────────────────────────────────────────────

function Panel({
  label, subtitle, items, value, onSelect, accent,
}: {
  label: string
  subtitle: string
  items: { id: string; icon: string; label: string; desc: string }[]
  value: string
  onSelect: (id: string) => void
  accent: string
}) {
  const [open, setOpen] = useState(true)

  return (
    <div style={{
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden',
      background: 'rgba(255,255,255,0.01)',
    }}>
      {/* Panel header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px', background: 'none', border: 'none',
          cursor: 'pointer', borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div style={{ textAlign: 'left' as const }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
            {label}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
            {subtitle}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Current value badge */}
          {value !== 'none' && (
            <span style={{
              fontSize: 9, padding: '2px 8px', borderRadius: 6,
              background: hexA(accent, 0.12),
              border: `1px solid ${hexA(accent, 0.3)}`,
              color: accent,
            }}>
              {items.find(i => i.id === value)?.label || value}
            </span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '12px 12px 14px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 5,
          }}>
            {items.map(item => {
              const isActive = value === item.id
              const isNone   = item.id === 'none'

              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 9px', borderRadius: 8, border: '1px solid',
                    cursor: 'pointer', transition: 'all .12s ease',
                    gridColumn: isNone ? '1 / -1' : 'auto',
                    borderColor: isActive
                      ? hexA(accent, 0.55)
                      : 'rgba(255,255,255,0.06)',
                    background: isActive
                      ? hexA(accent, 0.1)
                      : 'rgba(255,255,255,0.01)',
                  }}
                >
                  {/* Indicator dot */}
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? accent : 'rgba(255,255,255,0.15)',
                    boxShadow: isActive ? `0 0 6px ${accent}` : 'none',
                    transition: 'all .15s',
                  }} />
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ textAlign: 'left' as const, minWidth: 0 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 600, lineHeight: 1.2,
                      color: isActive ? accent : 'rgba(255,255,255,0.7)',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: 9, color: 'rgba(255,255,255,0.28)',
                      marginTop: 1, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                    }}>
                      {item.desc}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

interface Props {
  theme: Partial<Theme>
  update: (patch: Partial<Theme>) => void
}

export default function AnimationsSection({ theme, update }: Props) {
  const ac = theme.accentColor || '#c9a84c'

  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.02)',
      overflow: 'hidden',
    }}>
      {/* Section header */}
      <div style={{
        padding: '8px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>
            Animations & effects
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
            {[theme.entranceStyle, theme.priceFx, theme.categoryFx].filter(v => v && v !== 'none').length} active
          </div>
        </div>
        {/* Master disable */}
        <button
          onClick={() => {
            const allOff = theme.entranceStyle === 'none' && theme.priceFx === 'none' && theme.categoryFx === 'none'
            if (allOff) {
              update({ entranceStyle: 'fade-up', priceFx: 'shimmer', categoryFx: 'crossfade' })
            } else {
              update({ entranceStyle: 'none', priceFx: 'none', categoryFx: 'none' })
            }
          }}
          style={{
            fontSize: 9, padding: '3px 10px', borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
          }}
        >
          {theme.entranceStyle === 'none' && theme.priceFx === 'none' && theme.categoryFx === 'none'
            ? 'Enable all'
            : 'Disable all'}
        </button>
      </div>

      <div style={{ padding: '12px 12px 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* ── SPEED CONTROL (shared) ── */}
        <div style={{
          padding: '12px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
                Animation speed
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                Applies to all animations
              </div>
            </div>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: ac }}>
                {speedLabel(theme.animSpeed ?? 5)}
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                {speedSec(theme.animSpeed ?? 5)}
              </div>
            </div>
          </div>
          <input
            type="range" min={1} max={10}
            value={theme.animSpeed ?? 5}
            onChange={e => update({ animSpeed: Number(e.target.value) })}
            style={{
              width: '100%', height: 4, borderRadius: 2,
              appearance: 'none' as any, cursor: 'pointer',
              background: `linear-gradient(to right,
                ${ac} ${((theme.animSpeed ?? 5) - 1) / 9 * 100}%,
                rgba(255,255,255,0.1) ${((theme.animSpeed ?? 5) - 1) / 9 * 100}%)`,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Slow</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Fast</span>
          </div>
        </div>

        {/* ── PANEL 1: Item entrance ── */}
        <Panel
          label="Item entrance"
          subtitle={`12 styles · Staggered card entry`}
          items={ENTRANCE_STYLES}
          value={theme.entranceStyle ?? 'fade-up'}
          onSelect={v => update({ entranceStyle: v })}
          accent={ac}
        />

        {/* ── PANEL 2: Price effect ── */}
        <Panel
          label="Price effect"
          subtitle={`11 styles · Continuous price animation`}
          items={PRICE_STYLES}
          value={theme.priceFx ?? 'shimmer'}
          onSelect={v => update({ priceFx: v })}
          accent={ac}
        />

        {/* ── PANEL 3: Category transition ── */}
        <Panel
          label="Category transition"
          subtitle={`12 styles · When switching categories`}
          items={CATEGORY_STYLES}
          value={theme.categoryFx ?? 'crossfade'}
          onSelect={v => update({ categoryFx: v })}
          accent={ac}
        />

        <div style={{ height: 4 }} />
      </div>
    </div>
  )
}
