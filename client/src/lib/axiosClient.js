// Single Axios instance for the entire app.
// Request interceptor  → attaches JWT from localStorage automatically.
// Response interceptor → unwraps response.data so services receive clean data,
//                        handles 401 globally (clears ALL auth state, redirects to /login).
// Components & hooks never touch .data, tokens, or catch 401s manually.

import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 10_000,
})

// ── Request: attach JWT ───────────────────────────────────────────────────────
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response: auto-unwrap + centralised error handling ───────────────────────
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Preserve the full server error shape so callers can surface specific messages.
    // error.response?.data is e.g. { message: 'Email already in use', code: 'EMAIL_EXISTS' }
    const serverError = error.response?.data ?? { message: error.message ?? 'An unexpected error occurred' }

    if (error.response?.status === 401) {
      // Clear BOTH localStorage AND Zustand's persisted store so RequireAuth
      // sees no token and does not redirect back to '/', breaking the loop.
      localStorage.removeItem('token')
      try {
        const zustandRaw = localStorage.getItem('invoicio-auth')
        if (zustandRaw) {
          const parsed = JSON.parse(zustandRaw)
          if (parsed?.state) {
            parsed.state.token = null
            parsed.state.user = null
            localStorage.setItem('invoicio-auth', JSON.stringify(parsed))
          }
        }
      } catch {
        // If parsing fails, just nuke the key entirely
        localStorage.removeItem('invoicio-auth')
      }
      window.location.href = '/login'
    }

    return Promise.reject(serverError)
  },
)

export default axiosClient
