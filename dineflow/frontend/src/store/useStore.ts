import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Venue, Theme } from '../types';

interface StoreState {
  // The Auth
  token: string | null
  user: User | null
  venue: Venue | null
  setAuth: (token: string, user: User, venue: Venue) => void
  clearAuth: () => void
  setUser: (user: User) => void
  setVenue: (venue: Venue) => void
  
  // Theme live preview in admin
  theme: Theme | null
  setTheme: (theme: Theme) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      venue: null,
      theme: null,
      
      setAuth: (token, user, venue) => set({ token, user, venue }),
      clearAuth: () => set({ token: null, user: null, venue: null, theme: null }),
      setUser: (user) => set({ user }),
      setVenue: (venue) => set({ venue }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'dineflow-store',
      partialize: (s) => ({ token: s.token, user: s.user, venue: s.venue }),
    }
  )
);
