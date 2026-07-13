import { IBM_Plex_Mono, Unbounded } from 'next/font/google'

// Шрифты страниц-заглушек (см. ComingSoon.tsx): геометрический дисплейный
// гротеск на заголовок + моноширинный на технические подписи («СКОРО»,
// нумерация пунктов). Кириллица обязательна.
export const unbounded = Unbounded({
    subsets: ['cyrillic', 'latin'],
    weight: ['700'],
    variable: '--font-cs-display',
    display: 'swap',
})

export const plexMono = IBM_Plex_Mono({
    subsets: ['cyrillic', 'latin'],
    weight: ['500'],
    variable: '--font-cs-mono',
    display: 'swap',
})
