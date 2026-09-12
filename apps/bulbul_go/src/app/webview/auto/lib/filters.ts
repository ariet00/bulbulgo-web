// Черновик фильтров ленты и его конвертация в ListingFilters. Отдельный
// модуль без 'use client': серверный префетч (page.tsx) должен собрать
// ровно тот объект фильтров, с которым MarketClient сделает первый запрос —
// ключ React Query включает фильтры целиком, и любое расхождение означало бы
// промах мимо гидрированного кэша.

import type { RegionItem } from './api'
import type { ListingFilters, ListingKind } from './types'

/** Черновик значений: enum → массив, bool → true, int/decimal → {min,max}. */
export type FilterDraft = {
    priceMin?: number
    priceMax?: number
    priceCurrency: 'USD' | 'KGS'
    region?: RegionItem
    enums: Record<string, string[]>
    bools: Record<string, boolean>
    ranges: Record<string, { min?: number; max?: number }>
}

export function emptyDraft(): FilterDraft {
    return { priceCurrency: 'USD', enums: {}, bools: {}, ranges: {} }
}

export function draftToFilters(
    draft: FilterDraft,
    kind: ListingFilters['kind'],
    makeModel: { make?: string; models?: string[] },
): ListingFilters {
    const eq: Record<string, string | number | boolean> = {}
    const anyOf: Record<string, string[]> = {}
    if (makeModel.make) eq.make = makeModel.make
    if (makeModel.models?.length) anyOf.model = makeModel.models
    for (const [k, v] of Object.entries(draft.bools)) if (v) eq[k] = true
    for (const [k, vals] of Object.entries(draft.enums)) {
        if (vals.length === 1) eq[k] = vals[0]
        else if (vals.length > 1) anyOf[k] = vals
    }
    const ranges: ListingFilters['ranges'] = {}
    for (const [k, r] of Object.entries(draft.ranges)) {
        if (r.min !== undefined || r.max !== undefined) ranges[k] = r
    }
    return {
        kind,
        eq,
        anyOf,
        ranges,
        priceMin: draft.priceMin,
        priceMax: draft.priceMax,
        priceCurrency: draft.priceCurrency,
        regionId: draft.region?.id,
    }
}

/** Стартовые значения ленты — те же, что у feedStore (kind/sort) и пустого
 * черновика: с ними MarketClient делает первый запрос после полной загрузки
 * страницы (стор не персистится), их же префетчит сервер. */
export const DEFAULT_FEED_KIND: ListingKind = 'offer'
export const DEFAULT_FEED_SORT: NonNullable<ListingFilters['sort']> = 'fresh'

export function defaultFeedFilters(): ListingFilters {
    return {
        ...draftToFilters(emptyDraft(), DEFAULT_FEED_KIND, {}),
        sort: DEFAULT_FEED_SORT,
    }
}
