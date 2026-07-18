// Серверный помощник для smart-link страницы поездки: тянет публичную поездку
// с бэкенда и собирает данные для OG-превью (generateMetadata + opengraph-image).
// Краулеры чатов (WhatsApp/Telegram/Facebook) JS не выполняют — теги и картинку
// отдаём server-side.

export interface TripMeta {
    from: string
    to: string
    dateLabel: string
    price: number | null
    seats: number | null
    role: 'driver' | 'passenger' | 'parcel' | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

// «1 место / 2 места / 5 мест» — русская плюрализация для чипсов превью.
export function seatsLabel(n: number): string {
    const mod10 = n % 10
    const mod100 = n % 100
    let word = 'мест'
    if (mod10 === 1 && mod100 !== 11) word = 'место'
    else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
        word = 'места'
    return `${n} ${word}`
}

function formatDate(iso?: string): string {
    if (!iso) return ''
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
    }).format(d)
}

// Возвращает нормализованные данные поездки либо null (404/сеть/нет API_URL) —
// вызывающий подставляет дефолтное превью.
export async function fetchTripMeta(id: string): Promise<TripMeta | null> {
    if (!API_URL) return null
    try {
        const res = await fetch(`${API_URL}/trips/${id}`, {
            // Кэшируем на стороне Next, чтобы бот-краулеры не били бэкенд.
            next: { revalidate: 300 },
        })
        if (!res.ok) return null
        const t = await res.json()
        const from = t?.from_location?.name
        const to = t?.to_location?.name
        if (!from || !to) return null
        return {
            from,
            to,
            dateLabel: formatDate(t?.departure_date),
            price: typeof t?.price === 'number' ? t.price : null,
            seats: typeof t?.seats === 'number' ? t.seats : null,
            role: t?.role ?? null,
        }
    } catch {
        return null
    }
}
