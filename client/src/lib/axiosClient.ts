// Single Axios instance for the entire app.
//
// Request interceptor  → attaches JWT from localStorage as a Bearer token.
// Response interceptor → unwraps response.data (so callers receive the payload
//                        directly, never AxiosResponse<T>) and handles 401
//                        globally by clearing ALL auth state before redirecting
//                        to /login — preventing the Zustand-persist loop where
//                        the store re-hydrates the token and RequireAuth bounces
//                        the user back to '/' forever.
//
// HTTP method typings are overridden at the bottom so TypeScript agrees with
// what the interceptor actually delivers at call sites: T, not AxiosResponse<T>.

import axios from 'axios'
import type { ApiError } from '../types'

const client = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 10_000,
})

// ── Request: attach JWT ───────────────────────────────────────────────────────

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: unwrap + centralised error handling ────────────────────────────

client.interceptors.response.use(
  // Success — return the unwrapped payload so callers never touch .data
  (response) => response.data,

  (error) => {
    // Preserve the full server error object { message, code? } so pages can
    // surface the real server message instead of a generic fallback string.
    const serverError: ApiError = error.response?.data ?? {
      message: error.message ?? 'An unexpected error occurred',
    }

    if (error.response?.status === 401) {
      // Clear the standalone token key axiosClient reads on each request
      localStorage.removeItem('token')

      // Also null out the token inside Zustand's persisted entry.
      // Without this, Zustand re-hydrates the token on redirect, RequireAuth
      // passes, and the app loops back to '/' indefinitely.
      try {
        const raw = localStorage.getItem('invoicio-auth')
        if (raw) {
          const parsed = JSON.parse(raw) as { state?: { token?: unknown; user?: unknown } }
          if (parsed.state) {
            parsed.state.token = null
            parsed.state.user  = null
            localStorage.setItem('invoicio-auth', JSON.stringify(parsed))
          }
        }
      } catch {
        localStorage.removeItem('invoicio-auth')
      }

      window.location.href = '/login'
    }

    return Promise.reject(serverError)
  },
)

// ── Type override ─────────────────────────────────────────────────────────────
// Axios's built-in generics return Promise<AxiosResponse<T>>, but the
// interceptor transforms every response to T. This override aligns TypeScript
// with runtime behaviour so callers never incorrectly access .data on the result.

type AxiosClient = Omit<typeof client, 'get' | 'post' | 'put' | 'patch' | 'delete'> & {
  get<T = unknown>(url: string, config?: object): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: object): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: object): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, config?: object): Promise<T>
  delete<T = unknown>(url: string, config?: object): Promise<T>
}

export default client as AxiosClient
