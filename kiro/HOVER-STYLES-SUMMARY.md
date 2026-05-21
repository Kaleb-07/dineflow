# Hover Animation Styles - Quick Reference

## 18 Total Hover Styles Available

### 🎯 Transform-Based Animations (10 styles)
These animations move, scale, or transform the card itself.

| # | Style | Icon | Effect | Use Case |
|---|-------|------|--------|----------|
| 1 | **Lift** | ↑ | Lifts up + scales | Classic, elegant |
| 2 | **Glow** | ✨ | Glowing shadow | Modern, vibrant |
| 3 | **Tilt** | ⤸ | 3D tilt perspective | Creative, playful |
| 4 | **Zoom** | 🔍 | Zooms in | Image-heavy |
| 5 | **Bounce** | ⤴ | Bouncy spring | Fun, casual |
| 6 | **Rotate** | ↻ | Slight rotation | Unique, artistic |
| 7 | **Slide** | → | Slides up | Clean, minimal |
| 8 | **Flip** | ⟲ | 3D flip | Bold, attention-grabbing |
| 9 | **Pulse** | ◉ | Continuous pulse | Featured items |
| 10 | **Shake** | ⚡ | Quick shake | Energetic, dynamic |

### 🎨 Background Color Sweep Animations (8 styles)
These animations reveal an accent-colored background layer.

| # | Style | Icon | Effect | Direction |
|---|-------|------|--------|-----------|
| 11 | **BG Left→Right** | → | Sweeps left to right | Horizontal LTR |
| 12 | **BG Right→Left** | ← | Sweeps right to left | Horizontal RTL |
| 13 | **BG Center Out** | ↔ | Expands from center | Horizontal center |
| 14 | **BG Corners** | ⤢ | Radiates from corners | Radial gradient |
| 15 | **BG Diagonal** | ⤡ | Diagonal sweep | Top-left to bottom-right |
| 16 | **BG Reveal** | ▭ | Curtain reveal | Top to bottom |
| 17 | **BG Split** | ⇆ | Splits from sides | Both sides inward |
| 18 | **BG Wave** | 〰 | Wave expansion | Circular wave |

## How Background Animations Work

All background animations use the same technique:
1. A `::before` pseudo-element is positioned behind the card content
2. The pseudo-element has an accent-colored gradient background
3. On hover, the pseudo-element animates into view using transforms
4. The card content stays on top (z-index layering)
5. A subtle lift and shadow enhance the effect

### CSS Structure
```css
.guest-card {
  position: relative;
  overflow: hidden;
}

.guest-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: gradient(accent-color);
  z-index: -1;
  /* Initial state: hidden */
  transform: translateX(-100%);
}

.guest-card:hover::before {
  /* Animated state: visible */
  transform: translateX(0);
}
```

## Choosing the Right Style

### For Luxury/Fine Dining
- **Lift** - Classic and sophisticated
- **Glow** - Elegant shimmer
- **BG Reveal** - Dramatic curtain effect

### For Casual/Fun Dining
- **Bounce** - Playful energy
- **Shake** - Quirky and fun
- **BG Wave** - Organic, friendly

### For Modern/Trendy
- **Tilt** - Contemporary 3D
- **BG Diagonal** - Dynamic movement
- **BG Split** - Symmetrical modern

### For Minimal/Clean
- **Slide** - Simple and effective
- **BG Left→Right** - Clean sweep
- **BG Center Out** - Balanced expansion

### For Bold/Attention-Grabbing
- **Flip** - Eye-catching
- **Zoom** - In-your-face
- **BG Corners** - Radiating energy

## Performance Notes

- All animations use GPU-accelerated CSS properties (transform, opacity)
- Background animations add one pseudo-element per card
- No JavaScript execution during animation
- Smooth 60fps on modern devices
- Gracefully degrades on older browsers

## Accessibility

- Animations respect `prefers-reduced-motion` media query (future enhancement)
- Hover effects also work on touch devices (shows on tap/active state)
- All animations can be disabled by admin
- No flashing or strobing effects that could trigger seizures

## Admin Control

Admins have full control:
1. **Enable/Disable** - Toggle hover effects on/off
2. **Choose Style** - Select from 18 options
3. **Animation Speed** - Adjust speed (1-10 scale)
4. **Live Preview** - See changes instantly in preview iframe

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | 14+ | ✅ Full |
| Chrome Mobile | 90+ | ✅ Full |

## Future Enhancements

Potential additions:
- Custom color for background animations
- Combination styles (e.g., Lift + BG Left)
- Per-category hover styles
- Seasonal/themed animation packs
- Animation intensity control
- Custom easing curves
