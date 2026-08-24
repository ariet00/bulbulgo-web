// Data-слой авторынка поверх /api/v1/marketplace. Публичные чтения — обычный
// fetch (без auth, как каталог/лента у всех классифайдов); действия
// пользователя (подача, избранное, контакты) — authFetch с авто-refresh.

import { authFetch } from '../../auth'
import type {
    AttributeOption,
    CategoryNode,
    EffectiveAttribute,
    Listing,
    ListingContact,
    ListingDraft,
    ListingFilters,
    ListingPage,
    Photo,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const MP = `${API_URL}/marketplace`

// Сервис-скоупинг: бэкенд по слагу сервиса сам ограничивает каталог/ленту/
// «Мои»/«Избранное» поддеревом auto и валидирует категорию при подаче —
// клиенту не нужно знать category_id корня.
const SVC = { 'X-Service-Slug': 'auto' }

/** fetch к marketplace с заголовком сервиса. */
function mpFetch(url: string, init: RequestInit = {}): Promise<Response> {
    return fetch(url, { ...init, headers: { ...SVC, ...(init.headers ?? {}) } })
}

/** authFetch с заголовком сервиса (подача, мои, избранное, контакты). */
function mpAuthFetch(path: string, init: RequestInit = {}): Promise<Response> {
    return authFetch(path, {
        ...init,
        headers: { ...SVC, ...(init.headers ?? {}) },
    })
}

async function ok<T>(r: Response): Promise<T> {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return (await r.json()) as T
}

// ── каталог ──

export async function fetchCategories(): Promise<CategoryNode[]> {
    return ok(await mpFetch(`${MP}/categories`))
}

/** Курсы {code: сомов за единицу} (НБКР через бэк); {} пока не обновлялись. */
export async function fetchRates(): Promise<Record<string, number>> {
    try {
        return await ok(await fetch(`${API_URL}/currencies/rates`))
    } catch {
        return {}
    }
}

/** Эффективные атрибуты категории. Опции моделей (~3.5k) исключаются из
 * payload и догружаются по марке через fetchModelOptions. */
export async function fetchCategoryAttributes(
    categoryId: number,
    side?: 'offer' | 'want',
): Promise<EffectiveAttribute[]> {
    const qs = new URLSearchParams({ omit_options: 'model' })
    if (side) qs.set('side', side)
    return ok(await mpFetch(`${MP}/categories/${categoryId}/attributes?${qs}`))
}

export async function fetchModelOptions(brand: string): Promise<AttributeOption[]> {
    const qs = new URLSearchParams({ key: 'model', brand })
    return ok(await mpFetch(`${MP}/options?${qs}`))
}

// ── лента ──

export function filtersToQuery(f: ListingFilters, skip: number, limit: number): URLSearchParams {
    const qs = new URLSearchParams()
    qs.set('kind', f.kind)
    qs.set('skip', String(skip))
    qs.set('limit', String(limit))
    for (const [k, v] of Object.entries(f.eq ?? {})) qs.append('attr_eq', `${k}:${v}`)
    for (const [k, r] of Object.entries(f.ranges ?? {})) {
        if (r.min !== undefined) qs.append('attr_min', `${k}:${r.min}`)
        if (r.max !== undefined) qs.append('attr_max', `${k}:${r.max}`)
    }
    for (const [k, vals] of Object.entries(f.anyOf ?? {})) {
        if (vals.length) qs.append('attr_in', `${k}:${vals.join(',')}`)
    }
    if (f.priceMin !== undefined) qs.set('price_min', String(f.priceMin))
    if (f.priceMax !== undefined) qs.set('price_max', String(f.priceMax))
    if (f.priceCurrency) qs.set('price_currency', f.priceCurrency)
    if (f.regionId !== undefined) qs.set('region_id', String(f.regionId))
    if (f.sort && f.sort !== 'fresh') qs.set('sort', f.sort)
    return qs
}

export async function fetchListings(
    categoryId: number,
    filters: ListingFilters,
    skip = 0,
    limit = 20,
): Promise<ListingPage> {
    const qs = filtersToQuery(filters, skip, limit)
    qs.set('category_id', String(categoryId))
    return ok(await mpFetch(`${MP}/listings?${qs}`))
}

export async function fetchListing(id: number): Promise<Listing> {
    return ok(await mpFetch(`${MP}/listings/${id}`))
}

export async function fetchSimilar(id: number, limit = 10): Promise<ListingPage> {
    return ok(await mpFetch(`${MP}/listings/${id}/similar?limit=${limit}`))
}

/** Подходящие противоположные объявления (want ↔ offer). */
export async function fetchMatches(id: number, limit = 20): Promise<ListingPage> {
    return ok(await mpFetch(`${MP}/listings/${id}/matches?limit=${limit}`))
}

/** Счётчик просмотров — fire-and-forget. */
export function trackView(id: number): void {
    fetch(`${MP}/listings/${id}/view`, { method: 'POST' }).catch(() => {})
}

export function trackShare(id: number): void {
    fetch(`${MP}/listings/${id}/share`, { method: 'POST' }).catch(() => {})
}

// ── действия пользователя (auth) ──

export async function fetchContact(id: number): Promise<ListingContact> {
    return ok(await mpAuthFetch(`/marketplace/listings/${id}/contact`))
}

export async function createListing(draft: ListingDraft): Promise<Listing> {
    return ok(await mpAuthFetch('/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
    }))
}

export async function updateListing(
    id: number,
    patch: Partial<ListingDraft> & { status?: string; expire_at?: string },
): Promise<Listing> {
    return ok(await mpAuthFetch(`/marketplace/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
    }))
}

/** Продлить срок (и вернуть в публикацию, если снято по сроку). */
export async function renewListing(id: number): Promise<Listing> {
    return ok(await mpAuthFetch(`/marketplace/listings/${id}/renew`, { method: 'POST' }))
}

// «Мои»/«Избранное» скоупятся разделом на бэке — по X-Service-Slug.

export async function fetchMyListings(status?: string, skip = 0, limit = 50): Promise<ListingPage> {
    const qs = new URLSearchParams({ skip: String(skip), limit: String(limit) })
    if (status) qs.set('status', status)
    return ok(await mpAuthFetch(`/marketplace/listings/mine?${qs}`))
}

export async function fetchFavorites(skip = 0, limit = 50): Promise<ListingPage> {
    return ok(await mpAuthFetch(`/marketplace/favorites?skip=${skip}&limit=${limit}`))
}

export async function fetchFavoriteIds(): Promise<number[]> {
    return ok(await mpAuthFetch('/marketplace/favorites/ids'))
}

export async function addFavorite(id: number): Promise<void> {
    await mpAuthFetch(`/marketplace/listings/${id}/favorite`, { method: 'POST' })
}

export async function removeFavorite(id: number): Promise<void> {
    await mpAuthFetch(`/marketplace/listings/${id}/favorite`, { method: 'DELETE' })
}

export async function uploadPhoto(file: File): Promise<Photo> {
    const form = new FormData()
    form.append('file', file)
    return ok(await mpAuthFetch('/marketplace/upload-photo', { method: 'POST', body: form }))
}

// ── справочники и профиль (для wizard'а) ──

export interface RegionItem {
    id: number
    name: string
    kind?: string
}

export async function fetchRegions(q?: string): Promise<RegionItem[]> {
    const qs = new URLSearchParams({ limit: '60' })
    if (q?.trim()) qs.set('q', q.trim())
    else qs.set('popular', 'true')
    return ok(await fetch(`${API_URL}/regions/?${qs}`))
}

/** Профиль — префилл телефона в подаче, проверка владельца на странице
 * управления объявлением. */
export async function fetchMe(): Promise<{ id: number; phone: string | null }> {
    return ok(await mpAuthFetch('/users/me'))
}

export interface CurrencyItem {
    id: number
    code: string
    symbol: string
}

export async function fetchCurrencies(): Promise<CurrencyItem[]> {
    return ok(await fetch(`${API_URL}/currencies/`))
}

export interface ComplaintReason {
    id: number
    text: string
}

/** Причины жалоб для экрана «Пожаловаться» (контекст marketplace). */
export async function fetchComplaintReasons(): Promise<ComplaintReason[]> {
    return ok(await fetch(`${API_URL}/complaints/reasons?context=marketplace`))
}

export async function complain(id: number, reason: string, description?: string): Promise<void> {
    await mpAuthFetch(`/marketplace/listings/${id}/complain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, description }),
    })
}
