'use client'

import { useEffect } from 'react'
import { getTheme, waitForBridge } from './bridge'

/**
 * Подхватывает тему приложения через JS-мост: тёмная тема в приложении →
 * класс `dark` на <html> (класс-стратегия Tailwind из @doska/ui).
 * Вне приложения (мост не появился) ничего не делает — страница остаётся
 * в дефолтной светлой теме.
 */
export function ThemeSync() {
    useEffect(() => {
        let cancelled = false
        waitForBridge().then(async (ok) => {
            if (!ok || cancelled) return
            try {
                const theme = await getTheme()
                if (cancelled) return
                document.documentElement.classList.toggle(
                    'dark',
                    theme === 'dark',
                )
                document.documentElement.style.colorScheme = theme
                // Согласуем с инлайн-скриптом layout'а (?theme= →
                // sessionStorage), чтобы внутренние переходы не мигали.
                sessionStorage.setItem('bbg_theme', theme)
            } catch {
                // старая версия приложения без getTheme — остаёмся в светлой
            }
        })
        return () => {
            cancelled = true
        }
    }, [])

    return null
}
