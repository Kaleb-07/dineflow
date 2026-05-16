# 🚀 DineFlow Quick Start

## Prerequisites
- ✅ Node.js installed
- ✅ MySQL running on `localhost:3300`
- ✅ Database `dineflow` created

## Start in 3 Steps

### 1️⃣ Start Backend (Terminal 1)
```powershell
cd dineflow/backend
npm run dev
```
✅ Wait for: `Server running on port 5000`

### 2️⃣ Start Frontend (Terminal 2)
```powershell
cd dineflow/frontend
npm run dev
```
✅ Wait for: `Local: http://localhost:5173/`

### 3️⃣ Open Browser
Go to: **http://localhost:5173**

## 🎯 Quick Test

### Option A: Use Existing Admin
- Email: `admin@dineflow.com`
- Password: `admin123`

### Option B: Create New Account
1. Click "Register"
2. Fill in your details
3. Create your venue

## 📱 View Guest Menu
After login, your guest menu URL will be:
```
http://localhost:5173/menu/your-venue-slug
```

## 🔧 Troubleshooting

### Backend Error: "Can't connect to MySQL"
```powershell
# Check MySQL is running
# Verify .env file has correct DATABASE_URL
cd dineflow/backend
cat .env
```

### Frontend Error: "Network Error"
- Make sure backend is running on port 5000
- Check vite.config.ts has proxy configured
- Restart frontend dev server

### Database Out of Sync
```powershell
cd dineflow/backend
npx prisma db push
npx prisma generate
```

## 📚 Full Test Checklist
See `TEST-CHECKLIST.md` for comprehensive testing guide.

## 🎨 Features to Test
- ✅ Menu management (categories, items, variants)
- ✅ Theme customization (colors, fonts, layout)
- ✅ QR code generation
- ✅ Guest menu view
- ✅ Review system
- ✅ Venue settings
- ✅ Amenities management

## 🔑 Admin Credentials
- Email: `admin@dineflow.com`
- Password: `admin123`
- Venue: `demo-restaurant`
- Guest Menu: `http://localhost:5173/menu/demo-restaurant`
