import { useEffect, useRef, useState } from 'react'
import { create } from 'zustand'
import { X, Check, AlertTriangle, Info, Loader2, AlertCircle } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface ToastItem {
  id:        string
  type:      ToastType
  title:     string
  message?:  string
  duration?: number   // ms — 0 = stays until manually dismissed
  action?:   { label: string; onClick: () => void }
}

interface ToastStore {
  toasts: ToastItem[]
  add:    (toast: Omit<ToastItem, 'id'>) => string
  update: (id: string, patch: Partial<ToastItem>) => void
  remove: (id: string) => void
  clear:  () => void
}

// ── Store ─────────────────────────────────────────────────────
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    set(s => ({ toasts: [...s.toasts, { ...toast, id }] }))
    return id
  },

  update: (id, patch) =>
    set(s => ({ toasts: s.toasts.map(t => t.id === id ? { ...t, ...patch } : t) })),

  remove: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}))

// ── Convenience API Hook ──────────────────────────────────────
export function useToast() {
  const { add, update, remove, clear } = useToastStore()

  return {
    // Core
    show:    (toast: Omit<ToastItem, 'id'>) => add(toast),
    update,
    dismiss: remove,
    clear,

    // Shortcuts
    success: (title: string, message?: string, opts?: Partial<ToastItem>) =>
      add({ type: 'success', title, message, duration: 3500, ...opts }),

    error: (title: string, message?: string, opts?: Partial<ToastItem>) =>
      add({ type: 'error', title, message, duration: 5000, ...opts }),

    warning: (title: string, message?: string, opts?: Partial<ToastItem>) =>
      add({ type: 'warning', title, message, duration: 4000, ...opts }),

    info: (title: string, message?: string, opts?: Partial<ToastItem>) =>
      add({ type: 'info', title, message, duration: 3500, ...opts }),

    loading: (title: string, message?: string) =>
      add({ type: 'loading', title, message, duration: 0 }),

    // Common actions
    saved:   (what = 'Changes') => add({ type: 'success', title: `${what} saved`,   message: 'Published to guest menu',  duration: 3000 }),
    deleted: (what = 'Item')    => add({ type: 'success', title: `${what} deleted`, message: 'Removed successfully',      duration: 3000 }),
    updated: (what = 'Item')    => add({ type: 'success', title: `${what} updated`, message: 'Changes saved',             duration: 3000 }),
    created: (what = 'Item')    => add({ type: 'success', title: `${what} created`, message: 'Added successfully',        duration: 3000 }),
    copied:  (what = 'Link')    => add({ type: 'info',    title: `${what} copied`,  message: 'Pasted to your clipboard',  duration: 2500 }),
    offline: ()                 => add({ type: 'error',   title: 'No connection',   message: 'Check your internet',       duration: 0    }),
  }
}

// ── Icons per type ────────────────────────────────────────────
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <Check      size={15} strokeWidth={2.5} />,
  error:   <AlertCircle size={15} strokeWidth={2.5} />,
  warning: <AlertTriangle size={15} strokeWidth={2.5} />,
  info:    <Info       size={15} strokeWidth={2.5} />,
  loading: <Loader2    size={15} strokeWidth={2.5} className="animate-spin" />,
}

// ── Colors per type ───────────────────────────────────────────
const COLORS: Record<ToastType, {
  bg: string; border: string; icon: string; iconBg: string; progress: string
}> = {
  success: {
    bg:       '#0d1f18',
    border:   'rgba(34,197,94,0.25)',
    icon:     '#22c55e',
    iconBg:   'rgba(34,197,94,0.12)',
    progress: '#22c55e',
  },
  error: {
    bg:       '#1f0d0d',
    border:   'rgba(239,68,68,0.25)',
    icon:     '#ef4444',
    iconBg:   'rgba(239,68,68,0.12)',
    progress: '#ef4444',
  },
  warning: {
    bg:       '#1f1a0d',
    border:   'rgba(234,179,8,0.25)',
    icon:     '#eab308',
    iconBg:   'rgba(234,179,8,0.12)',
    progress: '#eab308',
  },
  info: {
    bg:       '#0d1520',
    border:   'rgba(59,130,246,0.25)',
    icon:     '#3b82f6',
    iconBg:   'rgba(59,130,246,0.12)',
    progress: '#3b82f6',
  },
  loading: {
    bg:       '#111318',
    border:   'rgba(168,162,158,0.2)',
    icon:     '#c9a84c',
    iconBg:   'rgba(201,168,76,0.12)',
    progress: '#c9a84c',
  },
}

// ── Single Toast ──────────────────────────────────────────────
function Toast({ toast }: { toast: ToastItem }) {
  const { remove } = useToastStore()
  const [visible,  setVisible]  = useState(false)
  const [leaving,  setLeaving]  = useState(false)
  const [progress, setProgress] = useState(100)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef    = useRef<number>(Date.now())
  const c = COLORS[toast.type]

  // Mount animation
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Auto-dismiss with progress bar
  useEffect(() => {
    if (!toast.duration || toast.duration === 0) return

    startRef.current = Date.now()
    const tick = 30 // ms
    intervalRef.current = setInterval(() => {
      const elapsed  = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100)
      setProgress(remaining)
      if (remaining <= 0) dismiss()
    }, tick)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [toast.duration, toast.id])

  const dismiss = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setLeaving(true)
    setTimeout(() => remove(toast.id), 380)
  }

  // Pause progress on hover
  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }
  const resume = () => {
    if (!toast.duration || toast.duration === 0) return
    const remaining = (progress / 100) * toast.duration
    startRef.current = Date.now() - (toast.duration - remaining)
    intervalRef.current = setInterval(() => {
      const elapsed   = Date.now() - startRef.current
      const rem = Math.max(0, 100 - (elapsed / toast.duration!) * 100)
      setProgress(rem)
      if (rem <= 0) dismiss()
    }, 30)
  }

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      style={{
        position: 'relative',
        minWidth: 280,
        maxWidth: 360,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
        transform: visible && !leaving
          ? 'translateX(0) scale(1)'
          : leaving
          ? 'translateX(110%) scale(0.95)'
          : 'translateX(110%) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
        transition: leaving
          ? 'transform 0.35s cubic-bezier(0.4,0,1,1), opacity 0.35s ease'
          : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        cursor: 'default',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Main content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 12px 14px' }}>

        {/* Icon */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: c.iconBg, color: c.icon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 1,
        }}>
          {ICONS[toast.type]}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.3,
          }}>
            {toast.title}
          </div>
          {toast.message && (
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,0.45)',
              marginTop: 2, lineHeight: 1.5,
            }}>
              {toast.message}
            </div>
          )}
          {/* Action button */}
          {toast.action && (
            <button
              onClick={() => { toast.action!.onClick(); dismiss() }}
              style={{
                marginTop: 6, fontSize: 11, fontWeight: 600,
                color: c.icon, background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, letterSpacing: 0.3,
              }}
            >
              {toast.action.label} →
            </button>
          )}
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all .15s', padding: 0,
            marginTop: 1,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress bar */}
      {toast.duration !== 0 && toast.type !== 'loading' && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          height: 2.5, borderRadius: '0 0 14px 14px',
          width: `${progress}%`,
          background: c.progress,
          transition: 'width 0.03s linear',
          opacity: 0.7,
        }} />
      )}

      {/* Loading spinner bar */}
      {toast.type === 'loading' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, overflow: 'hidden', borderRadius: '0 0 14px 14px' }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${c.progress}, transparent)`,
            animation: 'toast-loading-bar 1.4s ease-in-out infinite',
          }} />
        </div>
      )}
    </div>
  )
}

// ── Container — place once in App.tsx ─────────────────────────
export function ToastContainer() {
  const toasts = useToastStore(s => s.toasts)

  return (
    <>
      {/* Loading bar keyframe */}
      <style>{`
        @keyframes toast-loading-bar {
          0%   { transform: translateX(-100%) scaleX(0.5) }
          50%  { transform: translateX(0%)    scaleX(1)   }
          100% { transform: translateX(100%)  scaleX(0.5) }
        }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: 24, right: 24,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={t} />
          </div>
        ))}
      </div>
    </>
  )
}

export default ToastContainer
