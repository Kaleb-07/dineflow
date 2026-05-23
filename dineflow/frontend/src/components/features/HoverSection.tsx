// ─────────────────────────────────────────────────────────────
//  HoverSection.tsx
//  Drop this into ThemePage.tsx controls panel
//  Usage: <HoverSection theme={theme} update={update} />
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react'
import type { Theme } from '../../types'

// ── Animation definitions ─────────────────────────────────────
const TRANSFORM_STYLES = [
  { id: 'lift',   icon: '↑',  label: 'Lift',    desc: 'Classic upward float'         },
  { id: 'glow',   icon: '✦',  label: 'Glow',    desc: 'Luminous halo effect'          },
  { id: 'tilt',   icon: '⤸',  label: 'Tilt',    desc: '3D perspective tilt'           },
  { id: 'zoom',   icon: '⊕',  label: 'Zoom',    desc: 'Confident scale-in'            },
  { id: 'bounce', icon: '⤴',  label: 'Bounce',  desc: 'Playful spring energy'         },
  { id: 'rotate', icon: '↻',  label: 'Rotate',  desc: 'Subtle artful spin'            },
  { id: 'slide',  icon: '↟',  label: 'Slide',   desc: 'Clean upward glide'            },
  { id: 'flip',   icon: '⟲',  label: 'Flip',    desc: 'Dramatic 3D perspective'      },
  { id: 'pulse',  icon: '◉',  label: 'Pulse',   desc: 'Continuous breathing glow'     },
  { id: 'shake',  icon: '⚡',  label: 'Shake',   desc: 'Energetic micro-vibration'     },
]

const BG_STYLES = [
  { id: 'bg-ltr',      icon: '→',   label: 'Left → Right', desc: 'Sweeps left to right'    },
  { id: 'bg-rtl',      icon: '←',   label: 'Right → Left', desc: 'Sweeps right to left'    },
  { id: 'bg-center',   icon: '↔',   label: 'Center Out',   desc: 'Expands from center'     },
  { id: 'bg-corners',  icon: '⤢',   label: 'Corners',      desc: 'Radiates from corners'   },
  { id: 'bg-diagonal', icon: '⤡',   label: 'Diagonal',     desc: 'Diagonal sweep'          },
  { id: 'bg-reveal',   icon: '▭',   label: 'Reveal',       desc: 'Curtain top to bottom'   },
  { id: 'bg-split',    icon: '⇆',   label: 'Split',        desc: 'Both sides inward'       },
  { id: 'bg-wave',     icon: '〰',   label: 'Wave',         desc: 'Circular ripple'         },
]

// Map: which styles work best for each venue type
const RECOMMENDATIONS: Record<string, string[]> = {
  'Luxury / Fine Dining': ['lift', 'glow', 'bg-reveal'],
  'Casual / Bistro':      ['bounce', 'bg-ltr', 'slide'],
  'Modern / Trendy':      ['tilt', 'bg-diagonal', 'bg-split'],
  'Minimal / Clean':      ['slide', 'bg-center', 'bg-ltr'],
  'Bold / Vibrant':       ['zoom', 'flip', 'bg-wave'],
}

function hexA(hex: string, a: number) {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${a})`
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `rgba(${r},${g},${b},${a})`
}

interface Props {
  theme: Partial<Theme>
  update: (patch: Partial<Theme>) => void
}

export default function HoverSection({ theme, update }: Props) {
  const [tab, setTab] = useState<'transform' | 'background'>('transform')
  const ac = theme.accentColor || '#c9a84c'
  const all    = [...TRANSFORM_STYLES, ...BG_STYLES]
  const active = all.find(s => s.id === (theme.hoverStyle || 'lift'))

  // Speed label
  const speedLabel = (v: number) => {
    if (v <= 2) return 'Instant'
    if (v <= 4) return 'Fast'
    if (v <= 6) return 'Normal'
    if (v <= 8) return 'Relaxed'
    return 'Slow & cinematic'
  }

  // Convert 1–10 speed to seconds
  const speedToSeconds = (v: number) => ((v * 0.05) + 0.05).toFixed(2) + 's'
  
  const currentHoverStyle = theme.hoverStyle || 'lift'
  const currentHoverSpeed = theme.hoverSpeed ?? 5

  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(255,255,255,0.02)',
      overflow: 'hidden',
    }}>
      {/* Section header */}
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.3)' }}>
          Card hover effect
        </span>
        {/* Enable toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
            {currentHoverStyle === 'none' ? 'Off' : 'On'}
          </span>
          <button
            onClick={() => update({ hoverStyle: currentHoverStyle === 'none' ? 'lift' : 'none' })}
            style={{
              width: 36, height: 20, borderRadius: 10, border: 'none',
              background: currentHoverStyle !== 'none' ? ac : 'rgba(255,255,255,0.1)',
              position: 'relative', cursor: 'pointer', transition: 'background .2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
              background: 'white', transition: 'transform .2s',
              transform: currentHoverStyle !== 'none' ? 'translateX(18px)' : 'translateX(2px)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>
      </div>

      {currentHoverStyle === 'none' ? (
        <div style={{ padding: '20px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>
          Hover effects are disabled.<br />Toggle on to enable animations.
        </div>
      ) : (
        <div style={{ padding: '14px' }}>
          {/* Current selection preview - Large card */}
          {active && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 14px', marginBottom: 14,
              borderRadius: 12,
              background: hexA(ac, 0.08),
              border: `1px solid ${hexA(ac, 0.25)}`,
            }}>
              <span style={{ fontSize: 28 }}>{active.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 2 }}>{active.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{active.desc}</div>
              </div>
              <div style={{ 
                fontSize: 9, 
                color: 'rgba(255,255,255,0.4)', 
                textTransform: 'uppercase' as const, 
                letterSpacing: 1.2,
                fontWeight: 600,
                background: 'rgba(255,255,255,0.05)',
                padding: '4px 8px',
                borderRadius: 6,
              }}>
                {TRANSFORM_STYLES.find(s => s.id === currentHoverStyle) ? 'Transform' : 'BG Sweep'}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3 }}>
            {([
              { id: 'transform', label: 'Transform (10)' },
              { id: 'background', label: 'BG Sweep (8)' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: '5px 8px', borderRadius: 6, border: 'none',
                fontSize: 10, fontWeight: 500, cursor: 'pointer',
                background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: tab === t.id ? 'white' : 'rgba(255,255,255,0.4)',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Animation grid */}
          {tab === 'transform' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
              {TRANSFORM_STYLES.map(s => (
                <AnimCard
                  key={s.id}
                  style={s}
                  active={currentHoverStyle === s.id}
                  accent={ac}
                  onClick={() => update({ hoverStyle: s.id })}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
              {BG_STYLES.map(s => (
                <AnimCard
                  key={s.id}
                  style={s}
                  active={currentHoverStyle === s.id}
                  accent={ac}
                  onClick={() => update({ hoverStyle: s.id })}
                />
              ))}
            </div>
          )}

          {/* Speed control */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Animation speed</span>
              <span style={{ fontSize: 10, color: ac, fontFamily: 'monospace' }}>
                {speedLabel(currentHoverSpeed)} · {speedToSeconds(currentHoverSpeed)}
              </span>
            </div>
            <input
              type="range" min={1} max={10}
              value={currentHoverSpeed}
              onChange={e => update({ hoverSpeed: Number(e.target.value) })}
              style={{
                width: '100%', height: 4, borderRadius: 2,
                appearance: 'none' as any, cursor: 'pointer',
                background: `linear-gradient(to right, ${ac} ${((currentHoverSpeed) - 1) / 9 * 100}%, rgba(255,255,255,0.1) ${((currentHoverSpeed) - 1) / 9 * 100}%)`,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Instant</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>Cinematic</span>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>
              Recommendations by style
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {Object.entries(RECOMMENDATIONS).map(([label, ids]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', width: 110, flexShrink: 0 }}>
                    {label}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {ids.map(id => {
                      const found = all.find(s => s.id === id)
                      if (!found) return null
                      const isActive = currentHoverStyle === id
                      return (
                        <button key={id} onClick={() => update({ hoverStyle: id })} style={{
                          padding: '2px 8px', borderRadius: 6, border: '1px solid',
                          fontSize: 9, cursor: 'pointer',
                          borderColor: isActive ? hexA(ac, 0.6) : 'rgba(255,255,255,0.08)',
                          background: isActive ? hexA(ac, 0.12) : 'rgba(255,255,255,0.02)',
                          color: isActive ? ac : 'rgba(255,255,255,0.45)',
                        }}>
                          {found.icon} {found.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Single animation card ─────────────────────────────────────
function AnimCard({
  style, active, accent, onClick,
}: {
  style: { id: string; icon: string; label: string; desc: string }
  active: boolean
  accent: string
  onClick: () => void
}) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 10px', borderRadius: 9, border: '1px solid',
        borderColor: active
          ? `color-mix(in srgb, ${accent} 55%, transparent)`
          : hovered
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(255,255,255,0.06)',
        background: active
          ? `color-mix(in srgb, ${accent} 10%, transparent)`
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.01)',
        cursor: 'pointer',
        transition: 'all .15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Active indicator */}
      {active && (
        <div style={{
          position: 'absolute', top: 4, right: 4,
          width: 6, height: 6, borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 6px ${accent}`,
        }} />
      )}

      <span style={{
        fontSize: 16,
        transition: 'transform .15s ease',
        transform: hovered ? 'scale(1.2)' : 'scale(1)',
        display: 'inline-block',
      }}>
        {style.icon}
      </span>

      <div style={{ textAlign: 'left' as const, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, lineHeight: 1.2,
          color: active ? accent : 'rgba(255,255,255,0.75)',
        }}>
          {style.label}
        </div>
        <div style={{
          fontSize: 9, color: 'rgba(255,255,255,0.3)',
          marginTop: 1, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
          maxWidth: 80,
        }}>
          {style.desc}
        </div>
      </div>
    </button>
  )
}
