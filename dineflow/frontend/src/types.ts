export interface Venue {
  id: number
  slug: string
  name: string
  tagline?: string
  description?: string
  logo?: string
  coverPhoto?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  country?: string
  currency: string
  businessHours?: Record<string, { open: string; close: string }>
  facebook?: string
  instagram?: string
  twitter?: string
  tiktok?: string
  website?: string
  theme?: Theme
  amenities?: Amenity[]
  categories?: Category[]
  reviews?: Review[]
}

export interface Theme {
  id: number
  venueId: number
  // Colors
  bgColor: string
  accentColor: string
  cardColor: string
  textColor: string
  // Typography
  fontDisplay: string
  fontBody: string
  // Shape
  borderRadius: number
  cardPadding: number
  itemGap: number
  // Features
  showImages: boolean
  showPrice: boolean
  showMealTabs: boolean
  showDesc: boolean
  // New branding options
  cardStyle?: 'default' | 'compact' | 'imageTop' | 'minimal' | 'bold'
  menuLayout?: 'list' | 'grid'
  categoryStyle?: 'pills' | 'tabs' | 'dropdown' | 'icons' | 'polygon'
  polygonVariant?: 'hexagon' | 'diamond' | 'chevron' | 'octagon' | 'pentagon'
  drinkStyle?: 'same' | 'dark' | 'light' | 'accent'
  showAllergens?: boolean
  showBadges?: boolean
  imageShape?: 'rounded' | 'circle' | 'square'
  pricePosition?: 'bottom' | 'right' | 'badge'
  // Animation controls
  animateItems?: boolean
  animateHover?: boolean
  hoverStyle?: string
  hoverSpeed?: number // 1-10 scale, 5 is normal
  animatePrice?: boolean
  animateCategories?: boolean
  animationSpeed?: number // 1-10 scale, 5 is normal
  // Page animations (35 total styles)
  entranceStyle?: string  // 12 entrance animations
  priceFx?: string        // 11 price effects
  categoryFx?: string     // 12 category transitions
  animSpeed?: number      // unified speed control 1-10
}

export interface Amenity {
  id: number
  name: string
  icon: string
  sortOrder: number
}

export interface Category {
  id: number
  name: string
  type: 'FOOD' | 'DRINK'
  icon?: string
  image?: string
  sortOrder: number
  isActive: boolean
  items?: MenuItem[]
  _count?: { items: number }
}

export interface MenuItem {
  id: number
  name: string
  description?: string
  image?: string
  ingredients?: string[]
  allergens?: string[]
  tags?: string[]
  isFeatured: boolean
  isAvailable: boolean
  sortOrder: number
  categoryId: number
  category?: Category
  variants: Variant[]
}

export interface Variant {
  id: number
  label: string
  price: number
  isDefault: boolean
  isAvailable: boolean
  sortOrder: number
}

export interface Review {
  id: number
  type: 'HOTEL' | 'FOOD' | 'SERVICE'
  rating: number
  guestName?: string
  comment?: string
  isVisible: boolean
  createdAt: string
}

export interface User {
  id: number
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  venueId: number
  venue?: Venue
}

export interface AuthState {
  token: string | null
  user: User | null
  venue: Venue | null
}
