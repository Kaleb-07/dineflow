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
  showImages:   true,
  showPrice:    true,
  showMealTabs: true,
  showDesc:     true,
  // New defaults
  cardStyle:      'default',
  menuLayout:     'list',
  categoryStyle:  'pills',
  polygonVariant: 'hexagon',
  drinkStyle:     'same',
  showAllergens:  false,
  showBadges:     true,
  imageShape:     'rounded',
  pricePosition:  'bottom',
  // Animation defaults - all OFF by default
  animateItems:      false,
  animateHover:      false,
  hoverStyle:        'lift',
  animatePrice:      false,
  animateCategories: false,
  animationSpeed:    5, // 1-10 scale, 5 is normal
};

export function applyTheme(theme: Partial<Theme>) {
  const t = { ...defaults, ...theme };
  const r = document.documentElement;
  
  // Colors
  r.style.setProperty('--brand-bg',           t.bgColor!);
  r.style.setProperty('--brand-accent',        t.accentColor!);
  r.style.setProperty('--brand-card',          t.cardColor!);
  r.style.setProperty('--brand-text',          t.textColor!);
  
  // Typography
  r.style.setProperty('--brand-font-display',  t.fontDisplay!);
  r.style.setProperty('--brand-font-body',     t.fontBody!);
  
  // Shape
  r.style.setProperty('--brand-radius',        `${t.borderRadius}px`);
  r.style.setProperty('--brand-padding',       `${t.cardPadding}px`);
  r.style.setProperty('--brand-gap',           `${t.itemGap}px`);
  
  // Feature toggles
  r.dataset.showImages    = String(t.showImages    ?? true);
  r.dataset.showPrice     = String(t.showPrice     ?? true);
  r.dataset.showMealTabs  = String(t.showMealTabs  ?? true);
  r.dataset.showDesc      = String(t.showDesc      ?? true);
  r.dataset.showAllergens = String(t.showAllergens ?? false);
  r.dataset.showBadges    = String(t.showBadges    ?? true);
  
  // Style options
  r.dataset.cardStyle      = t.cardStyle      || 'default';
  r.dataset.menuLayout     = t.menuLayout     || 'list';
  r.dataset.categoryStyle  = t.categoryStyle  || 'pills';
  r.dataset.polygonVariant = t.polygonVariant || 'hexagon';
  r.dataset.drinkStyle     = t.drinkStyle     || 'same';
  r.dataset.imageShape     = t.imageShape     || 'rounded';
  r.dataset.pricePosition  = t.pricePosition  || 'bottom';
  
  // Animation options
  r.dataset.animateItems      = String(t.animateItems      ?? false);
  r.dataset.animateHover      = String(t.animateHover      ?? false);
  r.dataset.hoverStyle        = t.hoverStyle               || 'lift';
  r.dataset.animatePrice      = String(t.animatePrice      ?? false);
  r.dataset.animateCategories = String(t.animateCategories ?? false);
  r.dataset.animationSpeed    = String(t.animationSpeed    ?? 5);
}

export function useTheme(theme?: Partial<Theme> | null) {
  useEffect(() => {
    applyTheme(theme ?? {});
  }, [theme]);
}
