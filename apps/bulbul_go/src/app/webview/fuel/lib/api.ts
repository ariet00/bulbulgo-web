// Data-слой «Где Бензин» поверх /api/v1/fuel. Чтения (станции, карточка,
// meta) — обычный fetch без auth; отправка репорта — authFetch (ленивая
// авторизация через мост, см. ../auth.ts).

import { authFetch, getAccessToken } from '../../auth'
import type {
    FuelMeta,
    LatLng,
    Leaderboard,
    MyReport,
    MyStats,
    ReportPayload,
    Station,
    StationDetail,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const FUEL = `${API_URL}/fuel`

async function ok<T>(r: Response): Promise<T> {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return (await r.json()) as T
}

/** Публичный fetch, который представляется, если сессия страницы есть:
 * бэкенд тогда помечает is_mine/i_confirmed в выдаче. Протухший access →
 * тихая деградация до анонимного запроса (не роняем публичную карточку). */
async function optionalAuthFetch(url: string): Promise<Response> {
    const token = getAccessToken()
    if (!token) return fetch(url)
    const r = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    })
    if (r.status !== 401) return r
    return fetch(url)
}

export async function fetchStations(
    origin: LatLng,
    opts: { radiusKm?: number; fuelType?: string | null; limit?: number } = {},
): Promise<Station[]> {
    const params = new URLSearchParams({
        lat: String(origin.lat),
        lng: String(origin.lng),
        radius_km: String(opts.radiusKm ?? 30),
    })
    if (opts.limit) params.set('limit', String(opts.limit))
    if (opts.fuelType) params.set('fuel_type', opts.fuelType)
    const { items } = await ok<{ items: Station[] }>(
        await fetch(`${FUEL}/stations?${params}`),
    )
    return items
}

export async function fetchStation(
    id: number,
    origin: LatLng | null,
): Promise<StationDetail> {
    const params = new URLSearchParams()
    if (origin) {
        params.set('lat', String(origin.lat))
        params.set('lng', String(origin.lng))
    }
    const qs = params.size ? `?${params}` : ''
    // с токеном (если есть): бэкенд помечает is_mine/i_confirmed — иначе
    // на своих метках рисовалась бы кнопка «Подтвердить»
    return ok(await optionalAuthFetch(`${FUEL}/stations/${id}${qs}`))
}

export async function fetchMeta(): Promise<FuelMeta> {
    return ok(await fetch(`${FUEL}/meta`))
}

/** 429 — репорт по этой АЗС уже отправлялся недавно. */
export class ReportRateLimited extends Error {
    constructor() {
        super('report_rate_limited')
    }
}

export async function submitReport(
    stationId: number,
    payload: ReportPayload,
): Promise<{ points: number; bonuses: string[] }> {
    const r = await authFetch(`/fuel/stations/${stationId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (r.status === 429) throw new ReportRateLimited()
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const body = (await r.json()) as { points?: number; bonuses?: string[] }
    return { points: body.points ?? 0, bonuses: body.bonuses ?? [] }
}

export async function fetchMyReports(): Promise<MyReport[]> {
    const r = await authFetch('/fuel/my-reports')
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const { items } = (await r.json()) as { items: MyReport[] }
    return items
}

export async function confirmReport(reportId: number): Promise<number> {
    const r = await authFetch(`/fuel/reports/${reportId}/confirm`, {
        method: 'POST',
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const body = (await r.json()) as { confirmed_count: number }
    return body.confirmed_count
}

/** Отменить своё подтверждение (баллы обеих сторон отзываются). */
export async function unconfirmReport(reportId: number): Promise<number> {
    const r = await authFetch(`/fuel/reports/${reportId}/confirm`, {
        method: 'DELETE',
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const body = (await r.json()) as { confirmed_count: number }
    return body.confirmed_count
}

export async function fetchMyStats(): Promise<MyStats> {
    const r = await authFetch('/fuel/my-stats')
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return (await r.json()) as MyStats
}

export async function fetchLeaderboard(): Promise<Leaderboard> {
    const r = await authFetch('/fuel/leaderboard')
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return (await r.json()) as Leaderboard
}
