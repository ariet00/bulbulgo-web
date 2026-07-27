// Серверный помощник share-страницы объявления недвижимости: тянет публичное
// объявление и собирает данные для OG-превью. Краулеры чатов JS не выполняют —
// теги и картинку отдаём server-side.

export interface RealEstateMeta {
    title: string
    priceText: string | null
    cover: string | null
    specLine: string
    regionName: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Подписи стабильных значений каталога (сидер marketplace_taxonomy). Полный
// каталог ради OG не тянем.
const DEAL: Record<string, string> = {
    sale: 'Продажа',
    rent: 'Аренда',
    daily: 'Посуточно',
}
const WANT_VERB: Record<string, string> = {
    sale: 'Куплю',
    rent: 'Сниму',
    daily: 'Сниму посуточно',
}

export function formatAmount(n: number): string {
    return new Intl.NumberFormat('ru-RU').format(Math.round(n))
}

function priceLabel(price: number | null, code: string | null): string | null {
    if (price == null) return null
    const suffix = code === 'USD' ? '$' : code === 'KGS' ? 'сом' : (code ?? '')
    return `${formatAmount(price)} ${suffix}`.trim()
}

export async function fetchListingMeta(
    id: string,
): Promise<RealEstateMeta | null> {
    try {
        const r = await fetch(`${API_URL}/marketplace/listings/${id}`, {
            cache: 'no-store',
        })
        if (!r.ok) return null
        const l = await r.json()
        if (l.status !== 'active') return null

        const a = (l.attributes ?? {}) as Record<string, unknown>
        const spec: string[] = []
        // для аренды/посуточно тип сделки — ключевая информация заголовка
        if (l.kind !== 'want' && l.deal_type && l.deal_type !== 'sale') {
            spec.push(DEAL[l.deal_type as string] ?? String(l.deal_type))
        }
        if (typeof a.rooms === 'number') spec.push(`${a.rooms}-комн`)
        if (typeof a.area_total === 'number') spec.push(`${a.area_total} м²`)
        if (typeof a.land_area === 'number') {
            spec.push(`${formatAmount(a.land_area)} соток`)
        }
        if (typeof a.floor === 'number') {
            spec.push(
                typeof a.floors_total === 'number'
                    ? `этаж ${a.floor}/${a.floors_total}`
                    : `этаж ${a.floor}`,
            )
        }
        if (a.seller_type === 'owner') spec.push('Собственник')

        const rawTitle =
            typeof l.title === 'string'
                ? l.title
                : (l.title?.ru ?? 'Объявление')
        const isWant = l.kind === 'want'
        const price = priceLabel(l.price ?? null, l.currency_code ?? null)
        return {
            title: isWant
                ? `${WANT_VERB[l.deal_type as string] ?? 'Ищу'}: ${rawTitle}`
                : rawTitle,
            priceText: price && isWant ? `Бюджет до ${price}` : price,
            cover: l.photos?.[0]?.url ?? null,
            specLine: spec.join(' · '),
            regionName: l.region_name ?? null,
        }
    } catch {
        return null
    }
}
