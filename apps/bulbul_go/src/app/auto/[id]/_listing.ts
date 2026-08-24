// Серверный помощник share-страницы объявления: тянет публичное объявление и
// собирает данные для OG-превью. Краулеры чатов JS не выполняют — теги и
// картинку отдаём server-side.

export interface AutoMeta {
    title: string
    price: number | null
    currencyCode: string | null
    cover: string | null
    specLine: string
    regionName: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Подписи стабильных enum-значений каталога (slug → ru). Полный каталог ради
// OG не тянем — это фиксированные словарные значения сидера auto_catalog.
const FUEL: Record<string, string> = {
    petrol: 'Бензин',
    diesel: 'Дизель',
    gas_petrol: 'Газ-бензин',
    hybrid: 'Гибрид',
    electric: 'Электро',
}
const TRANSMISSION: Record<string, string> = {
    manual: 'Механика',
    automatic: 'Автомат',
    cvt: 'Вариатор',
    robot: 'Робот',
}

export function formatAmount(n: number): string {
    return new Intl.NumberFormat('ru-RU').format(Math.round(n))
}

export function priceLabel(price: number | null, code: string | null): string | null {
    if (price == null) return null
    const suffix = code === 'USD' ? '$' : code === 'KGS' ? 'сом' : (code ?? '')
    return `${formatAmount(price)} ${suffix}`.trim()
}

export async function fetchListingMeta(id: string): Promise<AutoMeta | null> {
    try {
        const r = await fetch(`${API_URL}/marketplace/listings/${id}`, {
            cache: 'no-store',
        })
        if (!r.ok) return null
        const l = await r.json()
        if (l.status !== 'active') return null

        const a = (l.attributes ?? {}) as Record<string, unknown>
        const spec: string[] = []
        if (typeof a.year === 'number') spec.push(String(a.year))
        if (typeof a.mileage === 'number') spec.push(`${formatAmount(a.mileage)} км`)
        if (typeof a.fuel === 'string' && FUEL[a.fuel]) spec.push(FUEL[a.fuel])
        if (typeof a.transmission === 'string' && TRANSMISSION[a.transmission]) {
            spec.push(TRANSMISSION[a.transmission])
        }
        if (a.steering === 'right') spec.push('Руль справа')

        const title =
            typeof l.title === 'string'
                ? l.title
                : (l.title?.ru ?? 'Объявление')
        return {
            title: l.kind === 'want' ? `Куплю: ${title}` : title,
            price: l.price ?? null,
            currencyCode: l.currency_code ?? null,
            cover: l.photos?.[0]?.url ?? null,
            specLine: spec.join(' · '),
            regionName: l.region_name ?? null,
        }
    } catch {
        return null
    }
}
