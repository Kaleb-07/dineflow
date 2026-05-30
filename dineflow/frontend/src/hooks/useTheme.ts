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
  hoverSpeed:        5, // 1-10 scale, 5 is normal
  animatePrice:      false,
  animateCategories: false,
  animationSpeed:    5, // 1-10 scale, 5 is normal
  // Page animation defaults
  entranceStyle:     'fade-up',
  priceFx:           'shimmer',
  categoryFx:        'crossfade',
  animSpeed:         5, // 1-10 scale, 5 is normal
  // Per-page visual style defaults
  aboutStyle:    'hero-story',
  reviewsStyle:  'spotlight',
  locationStyle: 'card-stack',
};

export function applyTheme(theme: Partial<Theme>) {
  // Strip null/undefined so DB nulls don't override our defaults.
  // e.g. DB stores priceFx: null → without this, null would overwrite defaults.priceFx='shimmer'
  const cleanTheme = Object.fromEntries(
    Object.entries(theme).filter(([, v]) => v !== null && v !== undefined)
  ) as Partial<Theme>;
  const t = { ...defaults, ...cleanTheme };
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
  // For legacy backward compatibility, fallback to boolean if present, else use strings.
  
  // CRITICAL: Set hover style attribute
  // Use ?? so a DB-stored null doesn't override a real saved value
  const hoverStyle = t.hoverStyle ?? (t.animateHover ? 'lift' : 'none');
  r.dataset.hoverStyle = hoverStyle;
  r.dataset.animateHover = String(hoverStyle !== 'none');
  
  // Page animation speed and data attributes
  const animSec = ((Number(t.animSpeed ?? 5) * 0.05) + 0.05).toFixed(2);
  r.style.setProperty('--anim-speed', `${animSec}s`);
  
  // Price animation speed
  const priceAnimSec = ((Number(t.animationSpeed ?? 5) * 0.05) + 0.05).toFixed(2);
  r.style.setProperty('--price-anim-speed', `${priceAnimSec}s`);
  
  // Hover animation speed CSS variable
  const speedSeconds = ((Number(t.hoverSpeed ?? 5) * 0.05) + 0.05).toFixed(2);
  r.style.setProperty('--hover-speed', `${speedSeconds}s`);
  
  // Use ?? — null from DB must NOT fall through to 'none'
  r.dataset.entrance   = t.entranceStyle ?? (t.animateItems       ? 'fade-up'   : 'none');
  r.dataset.priceFx    = t.priceFx       ?? (t.animatePrice      ? 'shimmer'   : 'none');
  r.dataset.categoryFx = t.categoryFx    ?? (t.animateCategories ? 'crossfade' : 'none');

  // Per-page visual styles
  r.dataset.aboutStyle    = t.aboutStyle    || 'hero-story';
  r.dataset.reviewsStyle  = t.reviewsStyle  || 'spotlight';
  r.dataset.locationStyle = t.locationStyle || 'card-stack';
}

export function useTheme(theme?: Partial<Theme> | null) {
  useEffect(() => {
    applyTheme(theme ?? {});
  }, [theme]);
}
