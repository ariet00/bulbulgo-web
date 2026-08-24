import type { Metadata, Viewport } from 'next'
import { SITE_URL } from '@/lib/site-url'
import '../globals.css'

// Публичная share-страница объявления авторынка (/auto/:id): превью + «открыть
// в приложении». Свой корневой layout без сайтового хрома/локали; путь /auto/*
// исключён из intl-миддлвары (см. proxy.ts).

export const metadata: Metadata = {
    // Каноничная база для абсолютных og:image (превью WhatsApp/Telegram).
    metadataBase: new URL(SITE_URL),
    title: 'BulBul Go — Авторынок',
    robots: { index: false, follow: false },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function AutoShareLayout({
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
