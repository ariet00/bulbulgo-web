// Типы marketplace-API (/api/v1/marketplace) в объёме, нужном авторынку.

export type LabelMap = Record<string, string>

export interface CategoryNode {
    id: number
    slug: string
    parent_id: number | null
    path: string
    sort_order: number
    is_active: boolean
    label: LabelMap
    icon: string | null
    children: CategoryNode[]
}

export interface AttributeOption {
    id: number
    value: string
    label: LabelMap
    sort_order: number
    /** марка-родитель для каскадных словарей (у опций моделей авто) */
    brand: string | null
    /** показывать в начале пикера (топовые марки рынка) */
    popular: boolean
    /** факты о модели, сужающие другие поля: {attr_key: [значения] | {min,max}}
     * (реальные годы выпуска, кузова, топливо) */
    constraints: Record<string, string[] | { min?: number; max?: number }> | null
}

export interface EffectiveAttribute {
    attribute_id: number
    key: string
    type: 'int' | 'decimal' | 'enum' | 'multi_enum' | 'bool' | 'string' | 'range'
    label: LabelMap
    unit: LabelMap | null
    is_required: boolean
    is_filterable: boolean
    applies_to: 'offer' | 'want' | 'both'
    /** стороны, где атрибут обязателен (год/пробег обязательны для продажи) */
    required_sides: ('offer' | 'want')[]
    /** границы значений int/decimal из каталога (для инпутов wizard'а) */
    min_value: number | null
    max_value: number | null
    /** условная видимость: показывать только при совпадении другого атрибута
     * (у электро нет объёма двигателя): {key, in?} | {key, not_in?} */
    visible_when: { key: string; in?: string[]; not_in?: string[] } | null
    sort_order: number
    role: string | null
    group: string | null
    group_label: LabelMap
    options: AttributeOption[]
}

export interface Photo {
    url: string
    thumb: string | null
    sort: number
}

export type ListingKind = 'offer' | 'want'

export interface Listing {
    id: number
    category_id: number
    category_slug: string | null
    category_label: LabelMap | null
    kind: ListingKind
    deal_type: string | null
    status: string
    user_id: number
    user_name: string | null
    user_avatar: string | null
    company_id: number | null
    company_name: string | null
    region_id: number | null
    region_name: string | null
    price: number | null
    currency_id: number | null
    currency_code: string | null
    currency_symbol: string | null
    expire_at: string | null
    title: string | LabelMap | null
    description: string | null
    /** скаляры у offer; критерии ({min,max} | список | скаляр) у want */
    attributes: Record<string, unknown>
    photos: Photo[]
    /** денормализованные счётчики карточки */
    views: number
    contacts: number
    created_at: string | null
}

export interface ListingPage {
    total: number
    items: Listing[]
}

export interface ListingContact {
    phone: string | null
    name: string | null
    telegram: string | null
    whatsapp: boolean
}

export interface ListingDraft {
    category_id: number
    kind: ListingKind
    deal_type?: string
    title?: string
    description?: string
    price?: number
    currency_id?: number
    region_id?: number
    attributes: Record<string, unknown>
    photos: Photo[]
    phone?: string
    whatsapp?: boolean
}

/** Фильтры ленты в терминах query-параметров бэка. */
export interface ListingFilters {
    kind: ListingKind
    /** точные значения атрибутов (make, fuel, steering…) */
    eq?: Record<string, string | number | boolean>
    /** диапазоны (year, mileage, engine_volume) */
    ranges?: Record<string, { min?: number; max?: number }>
    /** any-of (несколько моделей) */
    anyOf?: Record<string, string[]>
    priceMin?: number
    priceMax?: number
    /** валюта границ цены: бэк матчит и USD-, и KGS-объявления через курс */
    priceCurrency?: 'USD' | 'KGS'
    regionId?: number
    /** price_* — кросс-валютная (нормализация курсом на бэке) */
    sort?: 'fresh' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc'
}
