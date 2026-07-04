// База авторизации webview-страниц. Стандартный жизненный цикл:
//
//   const authed = await initWebviewAuth()      // ?code= → пара токенов
//   const r = await authFetch('/users/me')      // Bearer + авто-refresh
//
// Токены живут в sessionStorage (переживают внутренние переходы, умирают с
// вебвью). При истёкшем access authFetch сам обновляется через стандартный
// /auth/refresh-token; если умер и refresh (сессию завершили из профиля) —
// конвенция: тост + закрыть вебвью (приложение переоткроет с новым кодом),
// вне приложения — WebviewSessionExpired наверх.

import { bridgeAvailable, closeWebview, toast } from './bridge'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const ACCESS_KEY = 'bbg_access'
const REFRESH_KEY = 'bbg_refresh'

export class WebviewSessionExpired extends Error {
    constructor() {
        super('webview_session_expired')
    }
}

export function getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_KEY)
}

/**
 * Обменять одноразовый код из URL на пару токенов (код сразу стирается из
 * адресной строки). Без кода — true, если токены уже есть в sessionStorage.
 */
export async function initWebviewAuth(): Promise<boolean> {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (!code) return !!getAccessToken()

    url.searchParams.delete('code')
    window.history.replaceState(null, '', url.toString())

    const r = await fetch(`${API_URL}/auth/webview-exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    })
    if (!r.ok) return !!getAccessToken()

    const { access_token, refresh_token } = (await r.json()) as {
        access_token: string
        refresh_token: string
    }
    sessionStorage.setItem(ACCESS_KEY, access_token)
    sessionStorage.setItem(REFRESH_KEY, refresh_token)
    return true
}

async function refreshTokens(): Promise<boolean> {
    const refresh = sessionStorage.getItem(REFRESH_KEY)
    if (!refresh) return false
    const r = await fetch(
        `${API_URL}/auth/refresh-token?refresh_token=${encodeURIComponent(refresh)}`,
        { method: 'POST' },
    )
    if (!r.ok) return false
    const { access_token } = (await r.json()) as { access_token: string }
    sessionStorage.setItem(ACCESS_KEY, access_token)
    return true
}

async function onSessionDead(): Promise<never> {
    sessionStorage.removeItem(ACCESS_KEY)
    sessionStorage.removeItem(REFRESH_KEY)
    if (bridgeAvailable()) {
        await toast('Сессия истекла — откройте сервис заново', 'warning').catch(
            () => {},
        )
        await closeWebview().catch(() => {})
    }
    throw new WebviewSessionExpired()
}

/**
 * fetch к API бэка с Bearer-токеном и авто-refresh: `path` относительный
 * (`/users/me`). 401 → одна попытка refresh + повтор; refresh мёртв →
 * onSessionDead (см. шапку файла).
 */
export async function authFetch(
    path: string,
    init: RequestInit = {},
): Promise<Response> {
    const doFetch = () =>
        fetch(`${API_URL}${path}`, {
            ...init,
            headers: {
                ...(init.headers ?? {}),
                Authorization: `Bearer ${getAccessToken()}`,
            },
        })

    let response = await doFetch()
    if (response.status === 401) {
        if (!(await refreshTokens())) return onSessionDead()
        response = await doFetch()
        if (response.status === 401) return onSessionDead()
    }
    return response
}
