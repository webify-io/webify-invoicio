// Single Axios instance for the entire app.
// Request interceptor  → attaches JWT from localStorage automatically.
// Response interceptor → unwraps response.data so services receive clean data,
//                        handles 401 globally (clears token, redirects to /login).
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
    const message = error.response?.data?.message ?? error.message
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(message) // services receive a clean error string
  },
)

export default axiosClient
