import axios from 'axios'
import { toast } from 'sonner'

import { useAuthStore } from '@/store/useAuthStore'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api/v1'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  config.headers = config.headers ?? {}
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-Product'] = 'tglab'
  return config
})

/** Drop the session and bounce to the sign-in page (dead/absent refresh token). */
function toLogin() {
  useAuthStore.getState().clear()
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login'
  }
}

// Access tokens are short-lived; the refresh token is the shared, non-rotating
// one from /auth/refresh-token (the cabinet only owns the sign-in endpoint).
let refreshing: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) throw new Error('no refresh token')
  const { data } = await axios.post(`${baseURL}/auth/refresh-token`, null, {
    params: { refresh_token: refreshToken },
  })
  useAuthStore.getState().setToken(data.access_token)
  return data.access_token as string
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const status = error.response?.status

    if (status === 401 && original && !original._retry) {
      original._retry = true
      try {
        refreshing = refreshing ?? refreshAccessToken().finally(() => (refreshing = null))
        const token = await refreshing
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        toLogin()
        return Promise.reject(error)
      }
    }

    const message =
      error.response?.data?.message || error.response?.data?.detail || error.message
    if (typeof window !== 'undefined' && status !== 401) toast.error(message)
    return Promise.reject(error)
  },
)
