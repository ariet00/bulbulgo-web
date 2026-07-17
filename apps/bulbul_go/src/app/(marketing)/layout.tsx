import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import '../globals.css'
import Navbar from './_components/Navbar'
import Footer from './_components/Footer'

// Маркетинговый сайт go.bulbul.asia (Главная, Новости, FAQ, Обратная связь,
// Политика, Условия, Скачать). Свой корневой layout без сайтового хрома
// поиска поездок и без локали; пути /, /news, /faq, /support, /privacy,
// /terms, /download исключены из intl-миддлвары (см. proxy.ts).

export const metadata: Metadata = {
    title: 'BulBul Go',
    description:
        'BulBul Go — сервис для поиска попутчиков по всему Кыргызстану.',
    icons: { icon: '/favicon.png' },
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
        <html lang="ru">
            <body>
                <div className="min-h-screen font-sans bg-gray-50 flex flex-col scroll-smooth">
                    <Suspense fallback={null}>
                        <Navbar />
                    </Suspense>
                    <main className="flex-grow">{children}</main>
                    <Suspense fallback={null}>
                        <Footer />
                    </Suspense>
                </div>
            </body>
        </html>
    )
}
