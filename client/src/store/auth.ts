// Auth store — Zustand with persist middleware.
//
// The JWT is written to two places intentionally:
//   1. localStorage['token']         — read by axiosClient on every request
//   2. localStorage['invoicio-auth'] — Zustand persist (for UI state / RequireAuth)
//
// On logout, both are cleared. The axiosClient 401 handler also clears both
// to break the re-hydration loop: 401 → clear localStorage → redirect /login
// → Zustand re-hydrates token → RequireAuth passes → redirect '/' → repeat.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../types'

interface AuthState {
  token: string | null
  user:  AuthUser | null
  // Call after a successful login or register response
  setAuth: (token: string, user: AuthUser) => void
  // Call on explicit user logout
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user:  null,
      setAuth: (token, user) => {
        // Keep the standalone 'token' key in sync for the axiosClient interceptor
        localStorage.setItem('token', token)
        set({ token, user })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null })
      },
    }),
    // This key name MUST match the one cleared in axiosClient's 401 handler
    { name: 'invoicio-auth' },
  ),
)
