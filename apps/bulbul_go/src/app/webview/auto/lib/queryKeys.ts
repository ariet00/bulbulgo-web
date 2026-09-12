// Ключи React Query авторынка и размер страницы ленты. Отдельный модуль без
// 'use client': серверный префетч (page.tsx) кладёт данные под ТЕ ЖЕ ключи,
// что читают хуки lib/queries.ts — иначе гидрация прошла бы мимо кэша.

import type { ListingFilters } from './types'

export const PAGE = 20

export const qk = {
    catalog: ['am', 'catalog'] as const,
    attrs: (categoryId: number, side?: string) =>
        ['am', 'attrs', categoryId, side ?? 'all'] as const,
    models: (brand: string) => ['am', 'models', brand] as const,
    rates: ['am', 'rates'] as const,
    currencies: ['am', 'currencies'] as const,
    listings: (categoryId: number, filters: ListingFilters) =>
        ['am', 'listings', categoryId, filters] as const,
    listing: (id: number) => ['am', 'listing', id] as const,
    related: (id: number, kind: string) => ['am', 'related', id, kind] as const,
    mine: (status: string) => ['am', 'mine', status] as const,
    favorites: ['am', 'favorites'] as const,
}
