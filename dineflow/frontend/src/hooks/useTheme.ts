import { useEffect } from 'react';
import type { Theme } from '../types';

const defaults: Partial<Theme> = {
  bgColor:      '#0d1f1a',
  accentColor:  '#c9a84c',
  cardColor:    '#122219',
  textColor:    '#e8e0d0',
  fontDisplay:  "'Cormorant Garamond', serif",
  fontBody:     "'DM Sans', sans-serif",
  borderRadius: 8,
  cardPadding:  8,
  itemGap:      6,
};

export function applyTheme(theme: Partial<Theme>) {
  const t = { ...defaults, ...theme };
  const r = document.documentElement;
  r.style.setProperty('--brand-bg',           t.bgColor!);
  r.style.setProperty('--brand-accent',        t.accentColor!);
  r.style.setProperty('--brand-card',          t.cardColor!);
  r.style.setProperty('--brand-text',          t.textColor!);
  r.style.setProperty('--brand-font-display',  t.fontDisplay!);
  r.style.setProperty('--brand-font-body',     t.fontBody!);
  r.style.setProperty('--brand-radius',        `${t.borderRadius}px`);
  r.style.setProperty('--brand-padding',       `${t.cardPadding}px`);
  r.style.setProperty('--brand-gap',           `${t.itemGap}px`);
  r.dataset.showImages   = String(t.showImages   ?? true);
  r.dataset.showPrice    = String(t.showPrice    ?? true);
  r.dataset.showMealTabs = String(t.showMealTabs ?? true);
  r.dataset.showDesc     = String(t.showDesc     ?? true);
}

export function useTheme(theme?: Partial<Theme> | null) {
  useEffect(() => {
    applyTheme(theme ?? {});
  }, [theme]);
}
