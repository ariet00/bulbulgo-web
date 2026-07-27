// Data-слой «Где заправка» поверх /api/v1/fuel. Чтения (станции, карточка,
// meta) — обычный fetch без auth; отправка репорта — authFetch (ленивая
// авторизация через мост, см. ../auth.ts).

import { authFetch } from '../../auth'
import type {
    FuelMeta,
    LatLng,
    MyReport,
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

export async function fetchStations(
    origin: LatLng,
    opts: { radiusKm?: number; fuelType?: string | null } = {},
): Promise<Station[]> {
    const params = new URLSearchParams({
        lat: String(origin.lat),
        lng: String(origin.lng),
        radius_km: String(opts.radiusKm ?? 30),
    })
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
    return ok(await fetch(`${FUEL}/stations/${id}${qs}`))
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
): Promise<void> {
    const r = await authFetch(`/fuel/stations/${stationId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (r.status === 429) throw new ReportRateLimited()
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
}

export async function fetchMyReports(): Promise<MyReport[]> {
    const r = await authFetch('/fuel/my-reports')
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const { items } = (await r.json()) as { items: MyReport[] }
    return items
}
