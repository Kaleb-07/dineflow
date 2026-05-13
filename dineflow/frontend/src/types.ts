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
  bgColor: string
  accentColor: string
  cardColor: string
  textColor: string
  fontDisplay: string
  fontBody: string
  borderRadius: number
  cardPadding: number
  itemGap: number
  showImages: boolean
  showPrice: boolean
  showMealTabs: boolean
  showDesc: boolean
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
