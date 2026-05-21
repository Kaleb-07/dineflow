# 🎨 Branding Upgrade - Complete Guide

## What's New

The ThemePage has been completely upgraded with powerful new branding options that give restaurant owners full control over their menu's appearance.

---

## ✨ New Features

### 1. **Card Styles** (5 Options)

Choose how menu items are displayed:

- **Classic** (default) - Image on left, text on right. Traditional restaurant menu style.
- **Compact** - No images, name and price inline. Space-efficient for long menus.
- **Image Top** - Photo full-width above text. Instagram-style, great for visual menus.
- **Minimal** - Borderless list with just name and price. Clean, upscale tasting menu style.
- **Bold** - Full accent color background with white text. High-impact, modern look.

Each style includes a live mini preview card so admins see exactly what it looks like before saving.

### 2. **Google Fonts Picker** (30+ Fonts)

Replaces the old 6-font dropdown with a comprehensive font library:

- **Search** - Find fonts by name
- **Filter by category** - Serif, Sans-serif, Display, Handwriting
- **Live preview** - Each font renders in its own typeface in the list
- **Font pairing preview** - See heading + body font together before applying

Popular fonts included:
- **Serif**: Playfair Display, Cormorant Garamond, Lora, Merriweather
- **Sans-serif**: DM Sans, Inter, Outfit, Plus Jakarta Sans, Poppins
- **Display**: Bebas Neue, Righteous, Oswald
- **Handwriting**: Dancing Script, Pacifico

### 3. **Category Navigation Styles** (4 Options)

Control how category chips appear:

- **Pills** (default) - Rounded chips with borders, horizontal scrollable
- **Tabs** - Underline style with bottom border, clean minimal look
- **Dropdown** - Vertical menu list with hover effects and active indicator
- **Icons** - Large emoji/icon with name below, visual style

### 4. **Drink Section Styling** (4 Options)

Visually separate drinks from food:

- **Same as food** (default) - Consistent styling
- **Darker cards** - Drinks have darker background
- **Lighter cards** - Drinks have lighter background
- **Accent tinted** - Drinks use accent color tint

### 5. **New Feature Toggles**

- **Allergen info** - Show/hide allergen chips in item details
- **Feature badges** - Show/hide Vegan/Spicy/Chef's Pick tags

### 6. **Image Shape Options**

- **Rounded** (default) - Soft corners
- **Circle** - Perfect circles
- **Square** - Sharp corners

### 7. **Price Position Options**

- **Bottom** (default) - Below description
- **Right** - Aligned to the right
- **Badge** - Accent-colored badge style

---

## 🗄️ Database Changes

New fields added to the `Theme` model:

```prisma
cardStyle      String  @default("default")
menuLayout     String  @default("list")
categoryStyle  String  @default("pills")
drinkStyle     String  @default("same")
showAllergens  Boolean @default(false)
showBadges     Boolean @default(true)
imageShape     String  @default("rounded")
pricePosition  String  @default("bottom")
```

**Migration**: Run `npx prisma db push` to update the database.

---

## 🎯 How It Works

### Frontend (ThemePage.tsx)

1. **State Management** - All new options stored in theme state
2. **Live Preview** - Changes apply instantly to iframe preview
3. **Google Fonts** - Searchable, filterable font picker with live preview
4. **Card Style Previews** - Mini visual previews for each card style
5. **Save & Publish** - Persists to database via API

### Theme Hook (useTheme.ts)

The `applyTheme()` function now sets data attributes on the document root:

```typescript
r.dataset.cardStyle = theme.cardStyle || 'default'
r.dataset.menuLayout = theme.menuLayout || 'list'
r.dataset.categoryStyle = theme.categoryStyle || 'pills'
r.dataset.imageShape = theme.imageShape || 'rounded'
r.dataset.pricePosition = theme.pricePosition || 'bottom'
r.dataset.showAllergens = String(theme.showAllergens ?? false)
r.dataset.showBadges = String(theme.showBadges ?? true)
```

### CSS (index.css)

CSS rules respond to data attributes:

```css
[data-card-style="imageTop"] .guest-card {
  flex-direction: column;
}

[data-card-style="bold"] .guest-card {
  background: var(--brand-accent);
}

[data-menu-layout="grid"] .item-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

[data-image-shape="circle"] .item-image {
  border-radius: 50%;
}
```

---

## 🚀 Usage

### For Admins

1. Go to **Admin Panel** → **Branding**
2. Choose a **Card Style** from the 5 options
3. Pick fonts from the **Google Fonts** picker
4. Select **Category Navigation** style
5. Toggle features on/off
6. Watch changes apply instantly in the live preview
7. Click **Save & Publish**

### For Developers

All styles are controlled via data attributes, making it easy to add new options:

```typescript
// Add new option to types.ts
export interface Theme {
  // ... existing fields
  myNewOption?: 'value1' | 'value2'
}

// Add to useTheme.ts
r.dataset.myNewOption = theme.myNewOption || 'value1'

// Add CSS rule
[data-my-new-option="value2"] .some-element {
  /* styles */
}
```

---

## 📱 Responsive Behavior

- **Grid layout** automatically switches to single column on mobile
- **Category sidebar** becomes horizontal pills on mobile
- **Image shapes** maintain aspect ratio across all screen sizes
- **Card styles** adapt to mobile viewport

---

## 🎨 Design Philosophy

1. **Visual First** - Admins see what they're building with live previews
2. **No Code Required** - Everything configurable through UI
3. **Instant Feedback** - Changes apply immediately to preview
4. **Flexible** - Mix and match options for unique looks
5. **Professional** - All combinations look polished and intentional

---

## 🔧 Technical Details

### Performance

- Fonts loaded from Google Fonts CDN
- CSS uses data attributes (no JavaScript required for styling)
- Minimal re-renders with React state management
- Iframe preview isolated from admin panel

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid for layout
- CSS custom properties for theming
- Data attributes for conditional styling

### Accessibility

- All interactive elements keyboard accessible
- Color contrast maintained across all presets
- Font sizes remain readable
- Focus states visible

---

## 📝 Future Enhancements

Potential additions:

- **Animation options** - Fade in, slide up, etc.
- **Custom CSS** - Advanced users can add their own CSS
- **More card styles** - Masonry, carousel, etc.
- **Theme templates** - Pre-built complete themes
- **A/B testing** - Test different styles with guests
- **Analytics** - Track which styles perform best

---

## 🐛 Troubleshooting

### Fonts not loading
- Check Google Fonts CDN is accessible
- Verify font name spelling in picker
- Clear browser cache

### Styles not applying
- Ensure `npx prisma db push` was run
- Check browser console for errors
- Verify theme data saved to database

### Preview not updating
- Hard refresh the preview iframe
- Check cross-origin iframe access
- Verify venue slug is correct

---

## 📚 Related Files

- `frontend/src/pages/ThemePage.tsx` - Main branding UI
- `frontend/src/hooks/useTheme.ts` - Theme application logic
- `frontend/src/types.ts` - TypeScript interfaces
- `frontend/src/index.css` - Branding CSS rules
- `backend/prisma/schema.prisma` - Database schema

---

**Upgrade complete!** 🎉

Your restaurant owners now have professional-grade branding control without touching code.
