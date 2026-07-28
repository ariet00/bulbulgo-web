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

import {
    bridgeAvailable,
    closeWebview,
    isAuthorized,
    requestAuth,
    toast,
    waitForBridge,
} from './bridge'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const ACCESS_KEY = 'bbg_access'
const REFRESH_KEY = 'bbg_refresh'

export class WebviewSessionExpired extends Error {
    constructor() {
        super('webview_session_expired')
    }
}

// Разлогин в ПРИЛОЖЕНИИ (нативный профиль поверх вебвью) мгновенно гасит
// сессию страницы: бэкенд уже убил её на logout, чистим токены, чтобы UI
// не притворялся авторизованным. Страницы реагируют через onAuthChanged.
if (typeof window !== 'undefined') {
    window.addEventListener('bbg:authchanged', (e) => {
        if ((e as CustomEvent).detail !== true) {
            sessionStorage.removeItem(ACCESS_KEY)
            sessionStorage.removeItem(REFRESH_KEY)
        }
    })
}

export function getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_KEY)
}

/** Обменять одноразовый код на пару токенов в sessionStorage. */
async function exchangeCode(code: string): Promise<boolean> {
    const r = await fetch(`${API_URL}/auth/webview-exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    })
    if (!r.ok) return false

    const { access_token, refresh_token } = (await r.json()) as {
        access_token: string
        refresh_token: string
    }
    sessionStorage.setItem(ACCESS_KEY, access_token)
    sessionStorage.setItem(REFRESH_KEY, refresh_token)
    return true
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
    // Сохраняем history.state: Next App Router хранит в нём своё состояние,
    // replaceState(null) ломает навигацию назад по истории.
    window.history.replaceState(window.history.state, '', url.toString())

    return (await exchangeCode(code)) || !!getAccessToken()
}

/**
 * Тихая авторизация (для сервисов с `auth: false`): сессия из sessionStorage
 * или код от приложения БЕЗ какого-либо UI — сработает, если пользователь
 * залогинен в приложении. Зовите при загрузке, чтобы сразу показать
 * «авторизованный» интерфейс (имя, свои записи). false — страница анонимна.
 */
export async function trySilentAuth(): Promise<boolean> {
    if (getAccessToken()) return true
    if (!(await waitForBridge(1500))) return false
    try {
        const r = await requestAuth({ interactive: false })
        return !!r?.code && (await exchangeCode(r.code))
    } catch {
        return false
    }
}

/**
 * Гейт защищённого действия: есть сессия — true; нет — просим авторизацию у
 * приложения (залогинен → код молча; не залогинен → нативный экран входа
 * поверх вебвью, страница ничего не теряет). false — пользователь отменил
 * вход или страница открыта вне приложения.
 */
export async function ensureAuth(): Promise<boolean> {
    if (getAccessToken()) return true
    if (!bridgeAvailable()) return false
    try {
        const r = await requestAuth()
        if (r?.code && (await exchangeCode(r.code))) return true
    } catch {
        // упавший интерактивный путь добиваем страховкой ниже
    }
    // Страховка: интерактивный путь мог оборваться уже ПОСЛЕ успешного
    // входа (гонка чтения состояния на нативной стороне, потерянный промис,
    // пока вебвью был накрыт экраном логина). Если приложение фактически
    // залогинено — тихий повтор выдаст код без UI.
    try {
        if (await isAuthorized()) {
            const r = await requestAuth({ interactive: false })
            return !!r?.code && (await exchangeCode(r.code))
        }
    } catch {
        // мост недоступен/отвалился — честный false ниже
    }
    return false
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
