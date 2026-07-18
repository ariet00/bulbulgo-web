import type { Metadata } from 'next'
import SmartLinkClient from './_SmartLinkClient'
import { fetchTripMeta, roleLabel, seatsLabel } from './_trip'

const SITE_URL = 'https://go.bulbul.asia'

// OG-теги отдаём server-side: краулеры чатов (WhatsApp/Telegram/Facebook) не
// выполняют JS и читают только серверный <head>. Картинку рисует соседний
// opengraph-image.tsx (динамика под конкретную поездку).
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params
    const trip = await fetchTripMeta(id)
    const url = `${SITE_URL}/rideshare/trips/${id}`

    if (!trip) {
        return {
            title: 'BulBul Go — попутки Кыргызстана',
            robots: { index: false, follow: false },
            openGraph: {
                title: 'BulBul Go — попутки Кыргызстана',
                description: 'Открой поездку в приложении BulBul Go.',
                url,
                siteName: 'BulBul Go',
                type: 'website',
            },
        }
    }

    const title = `${trip.from} → ${trip.to}`
    const parts: string[] = []
    const role = roleLabel(trip.role)
    if (role) parts.push(role)
    if (trip.dateLabel) parts.push(trip.dateLabel)
    if (trip.price != null) parts.push(`${trip.price.toLocaleString('ru-RU')} сом`)
    if (trip.role !== 'parcel' && trip.seats != null) {
        parts.push(seatsLabel(trip.seats))
    }
    const description = parts.join(' · ') || 'Поездка в BulBul Go'

    return {
        title: `${title} — BulBul Go`,
        robots: { index: false, follow: false },
        openGraph: {
            title,
            description,
            url,
            siteName: 'BulBul Go',
            type: 'website',
            // images берётся из opengraph-image.tsx автоматически.
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    }
}

export default async function TripSmartLinkPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return <SmartLinkClient id={id} />
}
