import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { ThemeProvider } from 'next-themes'
import { SITE_URL } from '@/lib/site-url'
import '../globals.css'
import Navbar from './_components/Navbar'
import Footer from './_components/Footer'

// Маркетинговый сайт go.bulbul.asia (Главная, Новости, FAQ, Обратная связь,
// Политика, Условия, Скачать). Свой корневой layout без сайтового хрома
// поиска поездок и без локали; пути /, /news, /faq, /support, /privacy,
// /terms, /download исключены из intl-миддлвары (см. proxy.ts).

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: 'BulBul Go — поиск попутчиков по Кыргызстану',
        template: '%s — BulBul Go',
    },
    description:
        'BulBul Go — сервис для поиска попутчиков по всему Кыргызстану.',
    icons: { icon: '/favicon.png' },
    openGraph: {
        type: 'website',
        siteName: 'BulBul Go',
        locale: 'ru_RU',
        url: '/',
        title: 'BulBul Go — поиск попутчиков по Кыргызстану',
        description:
            'BulBul Go — сервис для поиска попутчиков по всему Кыргызстану.',
    },
    twitter: {
        card: 'summary_large_image',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
}

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="min-h-screen font-sans bg-background text-foreground flex flex-col scroll-smooth">
                        <Suspense fallback={null}>
                            <Navbar />
                        </Suspense>
                        <main className="flex-grow">{children}</main>
                        <Suspense fallback={null}>
                            <Footer />
                        </Suspense>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}
