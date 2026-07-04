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
