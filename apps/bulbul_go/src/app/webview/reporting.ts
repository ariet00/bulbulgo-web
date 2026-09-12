// Отправка JS-ошибок webview-страниц в трекинг бэка (analytics_events,
// event=webview_error) — видны в админке на странице «Ошибки». Fire-and-forget:
// репорт никогда не ломает саму страницу.

const API_URL = process.env.NEXT_PUBLIC_API_URL

export function reportWebviewError(
    message: unknown,
    extra?: Record<string, unknown>,
) {
    try {
        void fetch(`${API_URL}/analytics/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            body: JSON.stringify({
                event: 'webview_error',
                properties: {
                    message: String(message).slice(0, 500),
                    path: window.location.pathname,
                    ...extra,
                },
            }),
        }).catch(() => {})
    } catch {
        // ignore
    }
}

/**
 * Первый экран отрисован с данными (лента/пусто/ошибка вместо скелетона) —
 * событие webview_ready: хвост открытия, которого метрика приложения
 * webview_load не видит (она заканчивается на первом кадре документа).
 * Таймер — Navigation Timing: `ready_ms` от старта документа (≈ loadUrl в
 * приложении), `ttfb_ms` и `dcl_ms` — где ушло время (сеть/кэш vs парсинг и
 * гидрация), `ssr` — данные приехали в HTML (HydrationBoundary), а не
 * запрошены клиентом. Шлём со страницы, а не через мост: работает на всех
 * установленных версиях приложения. Fire-and-forget.
 */
export function reportWebviewReady(extra: { ssr: boolean }) {
    try {
        const nav = performance.getEntriesByType('navigation')[0] as
            | PerformanceNavigationTiming
            | undefined
        void fetch(`${API_URL}/analytics/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
            body: JSON.stringify({
                event: 'webview_ready',
                properties: {
                    slug: window.location.pathname.split('/')[2] ?? '',
                    path: window.location.pathname,
                    ready_ms: Math.round(performance.now()),
                    ...(nav && {
                        ttfb_ms: Math.round(nav.responseStart),
                        dcl_ms: Math.round(nav.domContentLoadedEventEnd),
                    }),
                    ...extra,
                },
            }),
        }).catch(() => {})
    } catch {
        // ignore
    }
}

let installed = false

/** Глобальные обработчики window.onerror / unhandledrejection (один раз). */
export function installGlobalErrorReporting() {
    if (installed || typeof window === 'undefined') return
    installed = true
    window.addEventListener('error', (e) =>
        reportWebviewError(e.message, { source: 'window.onerror' }),
    )
    window.addEventListener('unhandledrejection', (e) =>
        reportWebviewError(e.reason, { source: 'unhandledrejection' }),
    )
}
