import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008'

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

const DEVICE_ID_KEY = 'device_id'

function readOrCreate(key: string): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = window.localStorage.getItem(key)
    if (!id) {
      id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      window.localStorage.setItem(key, id)
    }
    return id
  } catch {
    return ''
  }
}

function getDeviceInfo(): string {
  if (typeof navigator === 'undefined') return ''
  const platform = navigator.platform || ''
  const ua = navigator.userAgent || ''
  return `${platform}; ${ua.split(')')[0]})`.slice(0, 200)
}

api.interceptors.request.use((config) => {
  const token = loadAccessToken()
  const slug = loadBotSlug()
  config.headers = config.headers ?? {}
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (slug) config.headers['X-Bot-Slug'] = slug
  config.headers['X-Product'] = 'booking'
  const deviceId = readOrCreate(DEVICE_ID_KEY)
  if (deviceId) config.headers['X-Device-Id'] = deviceId
  const deviceInfo = getDeviceInfo()
  if (deviceInfo) config.headers['X-Device-Info'] = deviceInfo
  return config
})
