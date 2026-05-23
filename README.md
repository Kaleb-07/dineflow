# DineFlow - Digital Menu Platform

A modern, full-stack digital menu platform for restaurants and hotels with advanced theming and animation capabilities.

## Features

### Guest Experience
- **Mobile-first responsive design** optimized for all devices
- **QR code access** for contactless menu viewing
- **Dynamic theming** with customizable colors, fonts, and layouts
- **Advanced animations** with 35+ animation styles
- **Multi-category menus** with smooth transitions
- **Item details** with variants, ingredients, and allergen information
- **Reviews system** for guest feedback

### Admin Dashboard
- **Menu management** with categories, items, and variants
- **Theme customization** with live preview
- **Animation controls** for entrance, price, and category effects
- **QR code generation** for table-specific menus
- **Bulk upload** via CSV for quick menu setup
- **Media management** for logos and item images
- **Review moderation** and analytics

### Technical Features
- **35+ animations** across 3 categories (entrance, price, category transitions)
- **18 hover effects** with GPU-accelerated transforms
- **Polygon category chips** with 5 shape variants
- **Multiple card styles** (default, compact, minimal, bold, image-top)
- **Layout options** (list, grid)
- **Category styles** (pills, tabs, icons, dropdown, polygon)
- **Accessibility** with reduced-motion support

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **TailwindCSS** for utility-first styling
- **Zustand** for state management
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Prisma ORM** with PostgreSQL
- **JWT** authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd dineflow
```

2. **Install backend dependencies**
```bash
cd dineflow/backend
npm install
```

3. **Configure backend environment**
Create `.env` file in `dineflow/backend/`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dineflow"
JWT_SECRET="your-secret-key"
PORT=5000
```

4. **Setup database**
```bash
npx prisma migrate dev
npx prisma generate
node seed.js
```

5. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

6. **Configure frontend environment**
Create `.env` file in `dineflow/frontend/`:
```env
VITE_API_URL=http://localhost:5000
```

7. **Start development servers**

Backend:
```bash
cd dineflow/backend
npm run dev
```

Frontend:
```bash
cd dineflow/frontend
npm run dev
```

## Default Credentials

After running the seed script:
- **Email:** admin@bellavista.com
- **Password:** admin123
- **Venue Slug:** bella-vista

## Project Structure

```
dineflow/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & validation
│   │   ├── routes/         # API routes
│   │   └── lib/            # Prisma client
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── uploads/            # User-uploaded files
│   └── index.js            # Server entry point
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Route pages
    │   ├── hooks/          # Custom React hooks
    │   ├── lib/            # Utilities & API client
    │   ├── store/          # Zustand state management
    │   ├── hover-animations.css    # 18 hover effects
    │   ├── page-animations.css     # 35 page animations
    │   └── index.css       # Global styles
    └── public/             # Static assets
```

## API Endpoints

### Public Routes
- `GET /api/public/:slug` - Get venue and menu data
- `POST /api/public/:slug/review` - Submit guest review

### Protected Routes (require JWT)
- `GET /api/settings` - Get venue settings
- `PATCH /api/settings` - Update venue info
- `PATCH /api/settings/theme` - Update theme
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/items` - List menu items
- `POST /api/items` - Create menu item
- `POST /api/upload` - Upload image
- `POST /api/bulk/upload` - Bulk CSV upload

## Animation System

### Entrance Animations (12 styles)
Cards animate in one-by-one with staggered delays:
- fade-up, fade-down, fade-left, fade-right
- scale-up, scale-down, flip, rotate
- blur, bounce, door, wave

### Price Effects (11 styles)
Continuous animations on price elements:
- shimmer, pulse-glow, typewriter, flash
- wave-color, bounce-scale, underline, neon
- reveal, stamp, gradient-shift

### Category Transitions (12 styles)
Smooth transitions when switching categories:
- crossfade, slide-left, slide-right, scale-fade
- flip-page, ripple, wipe-up, wipe-down
- morph, shutter, dissolve, split

## Deployment

See `kiro/DEPLOYMENT-GUIDE.md` for detailed deployment instructions.

## Documentation

- `kiro/QUICK-START.md` - Quick setup guide
- `kiro/ANIMATIONS-FINAL-GUIDE.md` - Animation system documentation
- `kiro/BULK-UPLOAD-GUIDE.md` - CSV bulk upload format
- `kiro/DEPLOYMENT-GUIDE.md` - Production deployment guide
- `kiro/FEATURE-SUMMARY.md` - Complete feature list

## License

Proprietary - All rights reserved
