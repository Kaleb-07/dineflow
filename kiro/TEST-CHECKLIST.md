# DineFlow Testing Checklist

## ✅ Pre-flight Checks Complete

1. ✅ Backend routes mounted correctly
2. ✅ Review routes added
3. ✅ Settings account & venue delete routes added
4. ✅ Vite proxy configured
5. ✅ Database schema synced
6. ✅ All dependencies installed

## 🚀 Start Servers

### Terminal 1 - Backend
```powershell
cd dineflow/backend
npm run dev
```
Expected output: `Server running on port 5000`

### Terminal 2 - Frontend
```powershell
cd dineflow/frontend
npm run dev
```
Expected output: `Local: http://localhost:5173/`

## 📋 Test Flow

### 1. Registration & Login
- [ ] Go to `http://localhost:5173/register`
- [ ] Fill in:
  - Name: `Test User`
  - Email: `test@example.com`
  - Password: `test123`
  - Venue Name: `Test Restaurant`
  - Slug: `test-restaurant` (auto-generated)
- [ ] Click "Create account"
- [ ] Should redirect to `/admin` dashboard
- [ ] Dashboard shows venue name and stats

### 2. Venue Setup (`/admin/venue`)
- [ ] Click "Venue" in sidebar
- [ ] Fill in Basic Info tab:
  - Tagline: `Fine Dining · Addis Ababa`
  - Description: `Experience authentic Ethiopian cuisine`
  - Phone: `+251 911 234 567`
  - Email: `info@testrestaurant.com`
  - Address: `123 Culinary Avenue`
  - City: `Addis Ababa`
  - Country: `Ethiopia`
- [ ] Switch to Amenities tab
- [ ] Click "+ Add amenity"
- [ ] Select "WiFi" and enter "Free WiFi"
- [ ] Add another: "Parking" → "Free Parking"
- [ ] Switch to Social tab
- [ ] Add Instagram: `https://instagram.com/testrestaurant`
- [ ] Click "Save all"
- [ ] Should see "Saved!" message

### 3. Menu Management (`/admin/menu`)
- [ ] Click "Menu" in sidebar
- [ ] Switch to "Categories" tab
- [ ] Click "+ Category"
- [ ] Create category:
  - Name: `Breakfast`
  - Icon: `🍳`
  - Type: `FOOD`
- [ ] Click "Create category"
- [ ] Switch back to "Items" tab
- [ ] Click "+ Add item"
- [ ] Fill in:
  - Item name: `Timatim Eggs`
  - Description: `Scrambled eggs with fresh tomatoes and berbere spice`
  - Category: `Breakfast`
  - Ingredients: `Eggs, Tomato, Berbere, Onion`
  - Allergens: `Eggs`
- [ ] In Variants section:
  - First variant: Label: `Full Plate`, Price: `120`
  - Click "+ Add variant"
  - Second variant: Label: `Half Plate`, Price: `80`
- [ ] Toggle "Featured" ON
- [ ] Toggle "Available" ON
- [ ] Click "Create item"
- [ ] Item should appear in the list under Breakfast category

### 4. Theme Customization (`/admin/theme`)
- [ ] Click "Theme" in sidebar
- [ ] Click "Bistro warm" preset
- [ ] Colors should change to warm tones
- [ ] Adjust "Card corner radius" slider
- [ ] Toggle "Item images" OFF then ON
- [ ] Click "Save & publish"
- [ ] Should see "✓ Saved!" message

### 5. QR Code Generation (`/admin/qr`)
- [ ] Click "QR" in sidebar
- [ ] Should see guest menu URL displayed
- [ ] Click "+ New QR"
- [ ] Fill in:
  - Label: `Table 1`
  - Type: `TABLE` (should be selected by default)
- [ ] Click "Create QR code"
- [ ] QR code should appear in grid
- [ ] Click "Download" button
- [ ] PNG file should download: `table-1-qr.png`
- [ ] Test bulk creation:
  - Click "Bulk tables"
  - Enter: `5`
  - Should create Table 2, Table 3, Table 4, Table 5, Table 6

### 6. Guest Menu View (`/menu/test-restaurant`)
- [ ] Open new tab: `http://localhost:5173/menu/test-restaurant`
- [ ] Should see:
  - Restaurant name: "Test Restaurant"
  - Tagline: "Fine Dining · Addis Ababa"
  - Warm color theme (Bistro warm preset)
  - Meal tabs: BREAKFAST, LUNCH, DINNER
  - Food/Drink toggle
  - Breakfast category chip with 🍳
- [ ] Click on "Timatim Eggs" item
- [ ] Modal should open showing:
  - Item name and description
  - Ingredients section with tags
  - Variants: Full Plate (120 ETB), Half Plate (80 ETB)
- [ ] Close modal
- [ ] Click "Reviews" in bottom nav
- [ ] Click "Share your experience"
- [ ] Fill in review:
  - Type: `FOOD`
  - Rating: 5 stars
  - Name: `John Doe`
  - Comment: `Amazing breakfast! The berbere spice is perfect.`
- [ ] Click "Submit review"
- [ ] Should see "Thank you for your review!"
- [ ] Click "About" in bottom nav
- [ ] Should see venue description and amenities
- [ ] Click "Find us" in bottom nav
- [ ] Should see address, phone, email

### 7. Review Management (`/admin/reviews`)
- [ ] Go back to admin panel
- [ ] Click "Reviews" in sidebar
- [ ] Should see the review from John Doe
- [ ] Toggle visibility OFF
- [ ] Refresh guest menu - review should be hidden
- [ ] Toggle visibility back ON
- [ ] Test delete button (optional)

### 8. Settings (`/admin/settings`)
- [ ] Click "Settings" in sidebar
- [ ] Account tab:
  - Change name to `Test Admin`
  - Click "Save changes"
- [ ] Venue tab:
  - Copy guest menu link
  - Paste in new tab - should work
  - Change currency to `USD`
  - Click "Save settings"
- [ ] Danger zone tab:
  - See delete venue button (don't click unless testing deletion)

## ✅ Success Criteria

All checkboxes above should be checked. The application should:
- ✅ Register and login without errors
- ✅ Save venue information
- ✅ Create categories and menu items
- ✅ Apply theme changes
- ✅ Generate QR codes
- ✅ Display guest menu with correct theme
- ✅ Accept and display reviews
- ✅ Update settings

## 🐛 Common Issues

### Backend won't start
- Check MySQL is running on port 3300
- Verify `.env` has correct DATABASE_URL
- Run `npx prisma db push` again

### Frontend API errors
- Check backend is running on port 5000
- Verify vite.config.ts has proxy configured
- Check browser console for CORS errors

### QR codes not rendering
- Verify `qrcode` package is installed
- Check browser console for canvas errors

### Theme not applying
- Clear browser cache
- Check theme was saved (click "Save & publish")
- Verify CSS variables in browser DevTools

## 📊 Database Check

Open Prisma Studio to verify data:
```powershell
cd dineflow/backend
npx prisma studio
```

Should see data in:
- User (1 record)
- Venue (1 record)
- Theme (1 record)
- Category (1+ records)
- MenuItem (1+ records)
- Variant (2+ records)
- Amenity (2+ records)
- Review (1+ records)
- QRCode (6+ records)
