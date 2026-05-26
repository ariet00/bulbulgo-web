import axios from 'axios'

// NEXT_PUBLIC_API_URL must include the /api/v1 suffix (matches the rest of the
// monorepo apps — content-manager etc). All requests below use paths RELATIVE
// to this base, e.g. `/akcha/me/` → `<base>/akcha/me/`.
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api/v1'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

const ACCESS_TOKEN_KEY = 'access_token'
const BOT_SLUG_KEY = 'bot_slug'

let memoryAccessToken: string | null = null
let memoryBotSlug: string | null = null

export function setAccessToken(token: string | null) {
  memoryAccessToken = token
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token)
    else localStorage.removeItem(ACCESS_TOKEN_KEY)
  }
}

export function loadAccessToken(): string | null {
  if (memoryAccessToken) return memoryAccessToken
  if (typeof window === 'undefined') return null
  memoryAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
  return memoryAccessToken
}

export function setBotSlug(slug: string | null) {
  memoryBotSlug = slug
  if (typeof window !== 'undefined') {
    if (slug) localStorage.setItem(BOT_SLUG_KEY, slug)
    else localStorage.removeItem(BOT_SLUG_KEY)
  }
}

export function loadBotSlug(): string | null {
  if (memoryBotSlug) return memoryBotSlug
  if (typeof window === 'undefined') return null
  memoryBotSlug = localStorage.getItem(BOT_SLUG_KEY)
  return memoryBotSlug
}

const ANONYMOUS_ID_KEY = 'analytics_anonymous_id'

function getAnonymousId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.localStorage.getItem(ANONYMOUS_ID_KEY)
    if (!id) {
      id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      window.localStorage.setItem(ANONYMOUS_ID_KEY, id)
    }
    return id
  } catch {
    return ''
  }
}

api.interceptors.request.use((config) => {
  const token = loadAccessToken()
  const slug = loadBotSlug()
  config.headers = config.headers ?? {}
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (slug) config.headers['X-Bot-Slug'] = slug
  const anon = getAnonymousId()
  if (anon) config.headers['X-Anonymous-Id'] = anon
  return config
})
