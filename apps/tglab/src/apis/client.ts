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

  // File uploads must NOT inherit the instance's JSON content type: without a
  // multipart boundary the server sees an empty body and reports every field
  // as missing. Dropping the header lets the browser set it with the boundary.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }
  return config
})

/**
 * FastAPI answers in two dialects: our own `{message}` and pydantic's
 * `{detail: [{loc, msg}, …]}` for a 422. The array must never reach a toast —
 * rendering it as a React child is what blanks the page.
 */
function readableError(body: any, fallback: string): string {
  if (typeof body?.message === 'string') return body.message

  const detail = body?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const lines = detail
      .map((item) => {
        // loc[0] is always "body"/"query" — the field name is what helps.
        const field = Array.isArray(item?.loc) ? item.loc.slice(1).join('.') : ''
        return field ? `${field}: ${item?.msg}` : item?.msg
      })
      .filter(Boolean)
    if (lines.length) return lines.join('; ')
  }
  return fallback
}


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
