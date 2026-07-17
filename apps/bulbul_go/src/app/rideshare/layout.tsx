import type { Metadata, Viewport } from 'next'
import '../globals.css'

// Smart-link страница «открыть в приложении». Загружается ТОЛЬКО когда
// приложение не открыло ссылку само (не установлено или in-app браузер):
// при установленном приложении Universal/App Link перехватывает URL и
// открывает нативный экран, а эта страница не рендерится.
// Свой корневой layout без сайтового хрома/локали; путь /rideshare/*
// исключён из intl-миддлвары (см. proxy.ts).

export const metadata: Metadata = {
    title: 'BulBul Go',
    robots: { index: false, follow: false },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function SmartLinkLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" className="bg-background" suppressHydrationWarning>
            <body className="bg-background text-foreground antialiased">
                {children}
            </body>
        </html>
    )
}
