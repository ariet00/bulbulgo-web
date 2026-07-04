import type { Metadata, Viewport } from 'next'
import '../globals.css'

// Страницы для вебвью мобильного приложения: свой корневой layout без
// сайтового хрома (шапка/футер/локаль/next-auth) — AppBar рисует само
// приложение. Роуты /webview/* исключены из intl-миддлвары (см. proxy.ts).

export const metadata: Metadata = {
    title: 'BulBul Go',
    robots: { index: false, follow: false },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

export default function WebviewLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru">
            <body className="bg-background text-foreground antialiased">
                {children}
            </body>
        </html>
    )
}
