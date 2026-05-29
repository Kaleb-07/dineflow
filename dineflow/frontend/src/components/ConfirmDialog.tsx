import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';

// ── Types & Store ─────────────────────────────────────────────
interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

interface ConfirmStore {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  isDestructive: boolean;
  resolve: ((value: boolean) => void) | null;
  show: (options: ConfirmOptions) => Promise<boolean>;
  confirm: () => void;
  cancel: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  isOpen: false,
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  isDestructive: false,
  resolve: null,

  show: (options) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        isDestructive: options.isDestructive ?? false,
        resolve,
      });
    });
  },

  confirm: () => {
    const { resolve } = get();
    if (resolve) resolve(true);
    set({ isOpen: false, resolve: null });
  },

  cancel: () => {
    const { resolve } = get();
    if (resolve) resolve(false);
    set({ isOpen: false, resolve: null });
  },
}));

// ── Drop-in React Hook ────────────────────────────────────────
export function useConfirm() {
  const show = useConfirmStore(s => s.show);
  return show;
}

// ── Reusable Component ────────────────────────────────────────
export function ConfirmDialog() {
  const { isOpen, title, message, confirmLabel, cancelLabel, isDestructive, confirm, cancel } = useConfirmStore();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure smooth CSS transition entry
      const timer = setTimeout(() => setActive(true), 20);
      return () => clearTimeout(timer);
    } else {
      setActive(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        pointerEvents: 'auto',
      }}
    >
      {/* Backdrop with transition */}
      <div
        onClick={cancel}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.25s ease-out',
        }}
      />

      {/* Dialog card with spring-like transition */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          background: '#0d1117',
          border: `1px solid ${isDestructive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(201, 168, 76, 0.2)'}`,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.03)',
          transform: active ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(12px)',
          opacity: active ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out',
        }}
      >
        {/* Header / Icon section */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '24px 24px 16px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              flexShrink: 0,
              background: isDestructive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(201, 168, 76, 0.1)',
              color: isDestructive ? '#ef4444' : '#c9a84c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDestructive ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: '#8b949e',
                margin: '8px 0 0 0',
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          </div>

          {/* Close corner button */}
          <button
            onClick={cancel}
            style={{
              background: 'none',
              border: 'none',
              color: '#484f58',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c9d1d9')}
            onMouseLeave={e => (e.currentTarget.style.color = '#484f58')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '16px 24px 24px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
          }}
        >
          <Button
            variant="ghost"
            onClick={cancel}
            className="text-gray-400 hover:text-white hover:bg-gray-800/50 px-4 py-2 text-xs font-semibold rounded-lg"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={confirm}
            className={`px-4 py-2 text-xs font-semibold rounded-lg text-white ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 active:bg-red-700'
                : 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600'
            }`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
