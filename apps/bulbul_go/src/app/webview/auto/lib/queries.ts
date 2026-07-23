'use client'

// React Query-хуки авторынка поверх fetch-функций lib/api.ts.
// Справочники (каталог, атрибуты, модели, курсы) — staleTime 1 час: грузятся
// один раз за сессию вебвью, все экраны читают кэш. Лента и карточка — SWR:
// мгновенный рендер из кэша + тихий фоновый рефетч.

import {
    useInfiniteQuery,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import {
    fetchCategories,
    fetchCategoryAttributes,
    fetchCurrencies,
    fetchFavorites,
    fetchListing,
    fetchListings,
    fetchMatches,
    fetchModelOptions,
    fetchMyListings,
    fetchRates,
    fetchSimilar,
} from './api'
import type { Listing, ListingFilters, ListingPage } from './types'

const HOUR = 3_600_000
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

// ── справочники ──

export function useCatalog() {
    return useQuery({
        queryKey: qk.catalog,
        queryFn: fetchCategories,
        staleTime: HOUR,
    })
}

export function useCategoryAttributes(
    categoryId: number | null,
    side?: 'offer' | 'want',
) {
    return useQuery({
        queryKey: qk.attrs(categoryId ?? 0, side),
        queryFn: () => fetchCategoryAttributes(categoryId!, side),
        enabled: categoryId !== null,
        staleTime: HOUR,
    })
}

export function useModelOptions(brand: string | undefined) {
    return useQuery({
        queryKey: qk.models(brand ?? ''),
        queryFn: () => fetchModelOptions(brand!),
        enabled: !!brand,
        staleTime: HOUR,
    })
}

export function useRates() {
    return useQuery({ queryKey: qk.rates, queryFn: fetchRates, staleTime: HOUR })
}

export function useCurrencies() {
    return useQuery({
        queryKey: qk.currencies,
        queryFn: fetchCurrencies,
        staleTime: HOUR,
    })
}

// ── лента ──

export function useListingsInfinite(
    categoryId: number | null,
    filters: ListingFilters,
) {
    return useInfiniteQuery({
        queryKey: qk.listings(categoryId ?? 0, filters),
        queryFn: ({ pageParam }) =>
            fetchListings(categoryId!, filters, pageParam, PAGE),
        initialPageParam: 0,
        getNextPageParam: (last, pages) => {
            const loaded = pages.reduce((n, p) => n + p.items.length, 0)
            return loaded < last.total ? loaded : undefined
        },
        enabled: categoryId !== null,
    })
}

/** Карточка: мгновенный рендер из кэша ленты/избранного (SWR — свежее
 * подтянется фоном), скелетон остаётся только у холодных диплинков. */
export function useListing(id: number) {
    const qc = useQueryClient()
    return useQuery({
        queryKey: qk.listing(id),
        queryFn: () => fetchListing(id),
        placeholderData: () => {
            for (const [, data] of qc.getQueriesData<{
                pages?: ListingPage[]
            }>({ queryKey: ['am', 'listings'] })) {
                for (const p of data?.pages ?? []) {
                    const hit = p.items.find((l) => l.id === id)
                    if (hit) return hit
                }
            }
            for (const [, page] of qc.getQueriesData<ListingPage>({
                queryKey: qk.favorites,
            })) {
                const hit = page?.items.find((l) => l.id === id)
                if (hit) return hit
            }
            return undefined
        },
    })
}

/** Похожие (offer) / подходящие предложения (want). */
export function useRelated(id: number, kind: Listing['kind'] | undefined) {
    return useQuery({
        queryKey: qk.related(id, kind ?? ''),
        queryFn: () =>
            kind === 'want' ? fetchMatches(id, 6) : fetchSimilar(id, 6),
        enabled: !!kind,
        select: (p) => p.items,
    })
}

// ── личные списки (enabled после авторизации) ──

export function useMyListings(status: string, authed: boolean) {
    return useQuery({
        queryKey: qk.mine(status),
        queryFn: () => fetchMyListings(status),
        enabled: authed,
    })
}

export function useFavorites(authed: boolean) {
    return useQuery({
        queryKey: qk.favorites,
        queryFn: () => fetchFavorites(),
        enabled: authed,
    })
}

// ── инвалидации после мутаций ──

/** Объявление изменилось (patch/renew/status): обновить карточку и
 * протухнуть все списки, где оно может быть. */
export function useListingInvalidation() {
    const qc = useQueryClient()
    return (updated?: Listing) => {
        if (updated) qc.setQueryData(qk.listing(updated.id), updated)
        void qc.invalidateQueries({ queryKey: ['am', 'listings'] })
        void qc.invalidateQueries({ queryKey: ['am', 'mine'] })
        void qc.invalidateQueries({ queryKey: qk.favorites })
    }
}
