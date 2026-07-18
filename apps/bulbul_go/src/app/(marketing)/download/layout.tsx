import type { Metadata } from 'next'

// page.tsx клиентский (редирект по userAgent), поэтому metadata живёт здесь.

export const metadata: Metadata = {
    title: 'Скачать приложение',
    description:
        'Скачайте приложение BulBul Go для iOS и Android — поиск попутчиков по всему Кыргызстану.',
    openGraph: {
        title: 'Скачать приложение BulBul Go',
        description:
            'Приложение BulBul Go для iOS и Android — поиск попутчиков по всему Кыргызстану.',
        url: '/download',
    },
}

export default function DownloadLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
