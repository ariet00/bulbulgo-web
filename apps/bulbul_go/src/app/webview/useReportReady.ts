'use client'

import { useEffect, useRef } from 'react'
import { reportWebviewReady } from './reporting'

/**
 * Один раз, когда первый экран отрисован с данными: шлёт webview_ready
 * (см. reportWebviewReady). `ready` — «скелетон ушёл»: лента, пусто или
 * ошибка — любое финальное состояние. `ssr` — данные были уже на первом
 * рендере (гидрация с сервера). Вызов уходит после кадра (rAF), чтобы DOM
 * уже был на экране, а не в момент смены состояния React.
 */
export function useReportReady(ready: boolean, ssr: boolean): void {
    const sent = useRef(false)
    useEffect(() => {
        if (!ready || sent.current) return
        sent.current = true
        const id = requestAnimationFrame(() => reportWebviewReady({ ssr }))
        return () => cancelAnimationFrame(id)
    }, [ready, ssr])
}
