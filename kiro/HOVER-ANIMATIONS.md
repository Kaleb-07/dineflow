# Hover Animation Styles

## Overview
The admin can now choose from **18 different hover animation styles** for menu items on the guest menu page. This includes 10 transform-based animations and 8 background color sweep animations. These features provide rich interactive feedback when guests hover over menu items.

## How to Use
1. Go to **Branding** page in admin panel
2. Scroll to **Animations & effects** section
3. Toggle **Hover effects** to ON
4. Select your preferred hover style from the 10 options

## Available Hover Styles

### Transform-Based Animations

### 1. **Lift** (Default)
- **Icon:** ↑
- **Effect:** Item lifts up and scales slightly with shadow
- **Best for:** Classic, elegant menus

### 2. **Glow**
- **Icon:** ✨
- **Effect:** Glowing shadow effect around the item
- **Best for:** Modern, vibrant menus

### 3. **Tilt**
- **Icon:** ⤸
- **Effect:** 3D tilt effect with perspective
- **Best for:** Creative, playful menus

### 4. **Zoom**
- **Icon:** 🔍
- **Effect:** Item zooms in significantly
- **Best for:** Image-heavy menus

### 5. **Bounce**
- **Icon:** ⤴
- **Effect:** Bouncy animation with spring effect
- **Best for:** Fun, casual dining

### 6. **Rotate**
- **Icon:** ↻
- **Effect:** Slight rotation with scale
- **Best for:** Unique, artistic menus

### 7. **Slide**
- **Icon:** →
- **Effect:** Slides up with shadow
- **Best for:** Clean, minimal designs

### 8. **Flip**
- **Icon:** ⟲
- **Effect:** 3D flip animation
- **Best for:** Bold, attention-grabbing menus

### 9. **Pulse**
- **Icon:** ◉
- **Effect:** Continuous pulsing scale animation
- **Best for:** Highlighting featured items

### 10. **Shake**
- **Icon:** ⚡
- **Effect:** Quick shake/wiggle effect
- **Best for:** Energetic, dynamic menus

### Background Color Sweep Animations

### 11. **BG Left→Right**
- **Icon:** →
- **Effect:** Accent color sweeps from left to right
- **Best for:** Modern, directional flow menus

### 12. **BG Right→Left**
- **Icon:** ←
- **Effect:** Accent color sweeps from right to left
- **Best for:** RTL languages, reverse flow

### 13. **BG Center Out**
- **Icon:** ↔
- **Effect:** Color expands from center horizontally
- **Best for:** Centered, balanced designs

### 14. **BG Corners**
- **Icon:** ⤢
- **Effect:** Radial gradient radiates from corners
- **Best for:** Soft, organic feel

### 15. **BG Diagonal**
- **Icon:** ⤡
- **Effect:** Diagonal sweep from top-left to bottom-right
- **Best for:** Dynamic, energetic menus

### 16. **BG Reveal**
- **Icon:** ▭
- **Effect:** Curtain reveal from top to bottom
- **Best for:** Theatrical, dramatic presentation

### 17. **BG Split**
- **Icon:** ⇆
- **Effect:** Color splits from both left and right sides
- **Best for:** Symmetrical, balanced designs

### 18. **BG Wave**
- **Icon:** 〰
- **Effect:** Wave-like circular expansion
- **Best for:** Fluid, organic menus

## Technical Details

### Database Schema
```prisma
model Theme {
  // ...
  animateHover  Boolean @default(false)
  hoverStyle    String  @default("lift")
  // ...
}
```

### CSS Implementation
Each hover style is implemented using CSS animations and transforms:
- **Transform styles** (lift, glow, tilt, etc.) use CSS transforms and box-shadow
- **Background styles** (bgLeft, bgRight, etc.) use pseudo-elements (::before/::after) with gradient backgrounds
- Styles are applied via `[data-animate-hover="true"][data-hover-style="stylename"]` selectors
- Background animations use `position: relative` and `overflow: hidden` on the card
- All animations respect the global animation speed setting (1-10 scale)
- Animations are disabled when `animateHover` is false

### Animation Speed
The hover animations respect the global **Animation speed** slider:
- **1 (Slowest)** - 1.2s duration
- **5 (Normal)** - 0.5s duration
- **10 (Instant)** - 0.2s duration

## Default Behavior
- **Hover effects:** OFF by default
- **Default style:** Lift (when enabled)
- All animations must be explicitly enabled by the admin

## Browser Compatibility
All hover styles use standard CSS transforms and animations, compatible with:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (touch devices show active state instead)

## Performance
- Animations use GPU-accelerated CSS transforms
- No JavaScript required for animation execution
- Minimal performance impact on modern devices

## Related Features
- **Animation speed** - Controls the speed of all animations including hover
- **Item entrance animations** - Staggered fade-in when page loads
- **Category animations** - Ripple effects on category navigation
- **Price shimmer** - Subtle shine effect on prices
