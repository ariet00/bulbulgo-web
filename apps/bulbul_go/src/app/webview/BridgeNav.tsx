'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// SPA-обработчик мостового openWebPage. Приложение НЕ перезагружает документ:
// оно переносит вебвью на новый нативный экран и диспатчит `bbg:navigate` —
// мы перехватываем событие (preventDefault) и переходим Next-роутером.
// Без обработчика (не-Next страница) приложение сделает location.assign.
// Возврат экрана приложение делает само: откатывает веб-историю (popstate,
// Next обрабатывает штатно) и нативно восстанавливает скролл под
// кадром-заморозкой — странице ничего делать не нужно.

// Отладочные хлебные крошки в sessionStorage (смотреть на /webview/test):
// переживают SPA-переходы и полные перезагрузки — по логу видно, где
// рвётся цепочка навигации.
export function bbgDebugLog(msg: string) {
    try {
        const arr = JSON.parse(
            sessionStorage.getItem('bbg_debug') || '[]',
        ) as string[]
        arr.push(`${new Date().toISOString().slice(11, 23)} ${msg}`)
        sessionStorage.setItem('bbg_debug', JSON.stringify(arr.slice(-30)))
    } catch {}
}

// Живёт в module scope документа: false после полной перезагрузки страницы.
let docAlive = false

export function BridgeNav() {
    const router = useRouter()

    useEffect(() => {
        bbgDebugLog(
            docAlive
                ? `BridgeNav remount (тот же документ) ${window.location.pathname}`
                : `BridgeNav mount (НОВЫЙ документ) ${window.location.pathname}`,
        )
        docAlive = true

        const onPopstate = () =>
            bbgDebugLog(`popstate → ${window.location.pathname}`)
        window.addEventListener('popstate', onPopstate)

        const handler = (e: Event) => {
            const url = (e as CustomEvent).detail?.url
            if (typeof url !== 'string') return
            let target: URL
            try {
                target = new URL(url, window.location.origin)
            } catch {
                bbgDebugLog(`navigate: битый url ${url}`)
                return
            }
            // Чужой origin SPA-переходом не открыть — пусть грузится по-настоящему.
            if (target.origin !== window.location.origin) {
                bbgDebugLog(`navigate: чужой origin ${target.origin}`)
                return
            }
            e.preventDefault()
            bbgDebugLog(`navigate → ${target.pathname}`)
            router.push(target.pathname + target.search + target.hash)
        }
        window.addEventListener('bbg:navigate', handler)
        return () => {
            window.removeEventListener('bbg:navigate', handler)
            window.removeEventListener('popstate', onPopstate)
        }
    }, [router])

    return null
}
