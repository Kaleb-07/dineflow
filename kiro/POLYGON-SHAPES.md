# Polygon Category Navigation Shapes

The polygon category navigation style now supports **5 different geometric shapes** that users can choose from.

## Available Shapes

### 1. **Hexagon** ⬢ (Default)
- Classic 6-sided polygon
- Balanced and modern look
- Clip-path: `polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%)`

### 2. **Diamond** ◆
- 4-sided rhombus shape
- Bold and eye-catching
- Clip-path: `polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`

### 3. **Chevron** ›
- Arrow/chevron pointing right
- Directional and dynamic
- Clip-path: `polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%)`

### 4. **Octagon** ⯃
- 8-sided stop-sign shape
- Geometric and structured
- Clip-path: `polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)`

### 5. **Pentagon** ⬟
- 5-sided shield shape
- Unique and distinctive
- Clip-path: `polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)`

## How to Use

1. Go to **Admin Panel** → **Branding**
2. In the **Category navigation** section, click **Polygon ⬢**
3. A new **Polygon shape** selector will appear below
4. Choose from: Hexagon, Diamond, Chevron, Octagon, or Pentagon
5. Changes apply instantly in the live preview
6. Click **Save & publish** to apply

## Features

All polygon shapes include:
- ✨ Smooth hover effects with scale transform
- 🎨 Active state with accent color glow
- 🔄 Seamless transitions between shapes
- 📱 Responsive design for mobile and desktop

## Technical Details

- **Database field**: `polygonVariant` (String, default: "hexagon")
- **CSS attribute**: `data-polygon-variant`
- **Type definition**: `'hexagon' | 'diamond' | 'chevron' | 'octagon' | 'pentagon'`

The shape selector only appears when the Polygon category style is active.
