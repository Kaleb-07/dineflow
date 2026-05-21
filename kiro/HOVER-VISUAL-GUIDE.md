# Hover Animation Visual Guide

## How to Read This Guide
Each animation is described with:
- **Visual representation** using ASCII art
- **Motion description** 
- **Best use case**

---

## Transform-Based Animations

### 1. Lift ↑
```
Before:          Hover:
┌─────────┐     ┌─────────┐
│  Item   │  →  │  Item   │ ↑ (moves up)
│  $10    │     │  $10    │   (scales 1.02x)
└─────────┘     └─────────┘
                   shadow
```
**Motion**: Lifts 4px up, scales to 102%, adds shadow  
**Feel**: Elegant, classic, professional

---

### 2. Glow ✨
```
Before:          Hover:
┌─────────┐     ╔═════════╗
│  Item   │  →  ║  Item   ║ (glowing border)
│  $10    │     ║  $10    ║ (multi-layer shadow)
└─────────┘     ╚═════════╝
```
**Motion**: No movement, adds glowing shadow layers  
**Feel**: Modern, vibrant, eye-catching

---

### 3. Tilt ⤸
```
Before:          Hover:
┌─────────┐        ╱─────────╲
│  Item   │  →    │   Item   │ (3D tilt)
│  $10    │       │   $10    │ (perspective)
└─────────┘        ╲─────────╱
```
**Motion**: 3D rotation (rotateY 5deg, rotateX -2deg)  
**Feel**: Creative, playful, dynamic

---

### 4. Zoom 🔍
```
Before:          Hover:
┌─────────┐     ┏━━━━━━━━━┓
│  Item   │  →  ┃  Item   ┃ (scales 1.08x)
│  $10    │     ┃  $10    ┃ (zooms in)
└─────────┘     ┗━━━━━━━━━┛
```
**Motion**: Scales to 108%, brings to front (z-index)  
**Feel**: Bold, attention-grabbing, image-focused

---

### 5. Bounce ⤴
```
Before:          Hover (animated):
┌─────────┐     ┌─────────┐ ↑↑
│  Item   │  →  │  Item   │ ↑
│  $10    │     │  $10    │ ↓
└─────────┘     └─────────┘ ↑ (bounces)
```
**Motion**: Bounces up with spring physics  
**Feel**: Fun, playful, energetic

---

### 6. Rotate ↻
```
Before:          Hover:
┌─────────┐       ╱────────╲
│  Item   │  →   │  Item   │ (rotates 2deg)
│  $10    │      │  $10    │ (scales 1.03x)
└─────────┘       ╲────────╱
```
**Motion**: Rotates 2deg clockwise, scales 103%  
**Feel**: Unique, artistic, quirky

---

### 7. Slide →
```
Before:          Hover:
┌─────────┐     ┌─────────┐
│  Item   │  →  │  Item   │ ↑↑ (slides up 8px)
│  $10    │     │  $10    │
└─────────┘     └─────────┘
                   shadow
```
**Motion**: Slides up 8px with shadow  
**Feel**: Clean, minimal, smooth

---

### 8. Flip ⟲
```
Before:          Hover (animated):
┌─────────┐     ╱─────────╲     ┌─────────┐
│  Item   │  →  │  Item   │  →  │  Item   │
│  $10    │     │  $10    │     │  $10    │
└─────────┘     ╲─────────╱     └─────────┘
   (0deg)         (180deg)        (360deg)
```
**Motion**: 360deg flip animation  
**Feel**: Bold, dramatic, attention-grabbing

---

### 9. Pulse ◉
```
Before:          Hover (continuous):
┌─────────┐     ┌─────────┐     ┏━━━━━━━━━┓
│  Item   │  →  │  Item   │  →  ┃  Item   ┃  → (repeats)
│  $10    │     │  $10    │     ┃  $10    ┃
└─────────┘     └─────────┘     ┗━━━━━━━━━┛
  (scale 1)     (scale 1.05)    (scale 1)
```
**Motion**: Continuous pulsing scale (1.0 → 1.05 → 1.0)  
**Feel**: Alive, breathing, featured

---

### 10. Shake ⚡
```
Before:          Hover (animated):
┌─────────┐     ┌─────────┐ ← → ← → ← (shakes)
│  Item   │  →  │  Item   │
│  $10    │     │  $10    │
└─────────┘     └─────────┘
```
**Motion**: Rapid horizontal shake (±4px)  
**Feel**: Energetic, dynamic, playful

---

## Background Sweep Animations

### 11. BG Left→Right →
```
Before:                    Hover (animated):
┌─────────────┐           ┌─────────────┐
│   Item      │    →      │███ Item     │ → (color sweeps)
│   $10       │           │███ $10      │
└─────────────┘           └─────────────┘
                          ┌─────────────┐
                          │█████████████│ (complete)
                          │█████████████│
                          └─────────────┘
```
**Motion**: Accent color sweeps from left edge to right  
**Feel**: Modern, directional, flowing

---

### 12. BG Right→Left ←
```
Before:                    Hover (animated):
┌─────────────┐           ┌─────────────┐
│   Item      │    →      │     Item ███│ ← (color sweeps)
│   $10       │           │      $10 ███│
└─────────────┘           └─────────────┘
                          ┌─────────────┐
                          │█████████████│ (complete)
                          │█████████████│
                          └─────────────┘
```
**Motion**: Accent color sweeps from right edge to left  
**Feel**: Reverse flow, RTL-friendly

---

### 13. BG Center Out ↔
```
Before:                    Hover (animated):
┌─────────────┐           ┌─────────────┐
│   Item      │    →      │  ███Item    │ ← → (expands)
│   $10       │           │  ███$10     │
└─────────────┘           └─────────────┘
                          ┌─────────────┐
                          │█████████████│ (complete)
                          │█████████████│
                          └─────────────┘
```
**Motion**: Expands horizontally from center outward  
**Feel**: Balanced, centered, symmetrical

---

### 14. BG Corners ⤢
```
Before:                    Hover (animated):
┌─────────────┐           ┌─────────────┐
│   Item      │    →      │█░░  Item    │ (radiates)
│   $10       │           │░░░  $10     │
└─────────────┘           └─────────────┘
                          ┌─────────────┐
                          │█████████████│ (complete)
                          │█████████████│
                          └─────────────┘
```
**Motion**: Radial gradient expands from top-left corner  
**Feel**: Organic, soft, natural

---

### 15. BG Diagonal ⤡
```
Before:                    Hover (animated):
┌─────────────┐           ┌─────────────┐
│   Item      │    →      │█░░  Item    │ ⤡ (diagonal)
│   $10       │           │░░░  $10     │
└─────────────┘           └─────────────┘
                          ┌─────────────┐
                          │█████████████│ (complete)
                          │█████████████│
                          └─────────────┘
```
**Motion**: Diagonal sweep from top-left to bottom-right  
**Feel**: Dynamic, energetic, modern

---

### 16. BG Reveal ▭
```
Before:                    Hover (animated):
┌─────────────┐           ┌─────────────┐
│   Item      │    →      │█████████████│ ↓ (curtain)
│   $10       │           │   Item      │
└─────────────┘           │   $10       │
                          └─────────────┘
                          ┌─────────────┐
                          │█████████████│ (complete)
                          │█████████████│
                          └─────────────┘
```
**Motion**: Curtain reveal from top to bottom  
**Feel**: Theatrical, dramatic, elegant

---

### 17. BG Split ⇆
```
Before:                    Hover (animated):
┌─────────────┐           ┌─────────────┐
│   Item      │    →      │█░░ Item ░░█│ ← → (splits)
│   $10       │           │█░░ $10  ░░█│
└─────────────┘           └─────────────┘
                          ┌─────────────┐
                          │█████████████│ (complete)
                          │█████████████│
                          └─────────────┘
```
**Motion**: Two layers sweep from left and right simultaneously  
**Feel**: Symmetrical, balanced, modern

---

### 18. BG Wave 〰
```
Before:                    Hover (animated):
┌─────────────┐           ┌─────────────┐
│   Item      │    →      │  ◉  Item    │ (wave expands)
│   $10       │           │ ░░░ $10     │
└─────────────┘           └─────────────┘
                          ┌─────────────┐
                          │█████████████│ (complete)
                          │█████████████│
                          └─────────────┘
```
**Motion**: Circular wave expands from center, morphs to rectangle  
**Feel**: Fluid, organic, natural

---

## Color Legend
- `█` = Full accent color
- `░` = Gradient/transitioning
- `│` = Card border
- `↑↓←→` = Direction of motion
- `⤡⤢` = Diagonal/radial motion

## Animation Timing
All animations use:
- **Duration**: 0.4s (adjustable via speed slider)
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Delay**: None (instant on hover)

## Combining Effects
All background animations also include:
- Subtle 2px lift
- Soft shadow (12% opacity)
- Border color change (40% accent)

This creates a cohesive hover experience across all styles.
