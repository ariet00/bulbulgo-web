import { Spectral } from 'next/font/google'

// Редакционный serif для заголовков новостей (кириллица обязательна).
// Подключается на уровне страниц /webview/news/*, не всего webview-layout.
export const spectral = Spectral({
    subsets: ['cyrillic', 'latin'],
    weight: ['600', '700'],
    variable: '--font-news-display',
    display: 'swap',
})
