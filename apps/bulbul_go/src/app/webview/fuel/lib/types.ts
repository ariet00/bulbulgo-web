// Типы fuel-API (/api/v1/fuel) в объёме, нужном webview-странице.

export type FuelType = 'ai92' | 'ai95' | 'ai98' | 'dt' | 'gas'
export type FuelStatus = 'available' | 'low' | 'incoming' | 'queue' | 'out'
export type QueueBucket = 'none' | 'lt10' | '10_30' | 'gt30'
export type Restriction = 'limit' | 'cash_only'

export interface FuelTypeStatus {
    status: FuelStatus
    queue: QueueBucket | null
    price: number | null
    restriction: Restriction | null
    updated_at: string
    is_stale: boolean
    reports_count: number
}

export interface Station {
    id: number
    name: string
    brand: string | null
    address: string | null
    logo: string | null
    lat: number
    lng: number
    distance_km: number | null
    fuel_types: FuelType[]
    statuses: Partial<Record<FuelType, FuelTypeStatus>>
}

export interface Report {
    id: number
    fuel_type: FuelType
    status: FuelStatus
    queue: QueueBucket | null
    price: number | null
    restriction: Restriction | null
    note: string | null
    created_at: string
    is_mine: boolean
    confirmed_count: number
    i_confirmed: boolean
}

export interface FuelLevel {
    slug: string
    label: string
    points: number
    next_label: string | null
    next_at: number | null
}

export interface FuelBadge {
    key: string
    label: string
}

export interface MyStats {
    level: FuelLevel
    reports_count: number
    confirms_received: number
    badges: FuelBadge[]
}

export interface LeaderboardItem {
    user_id: number
    name: string
    points: number
    is_me: boolean
}

export interface Leaderboard {
    week_start: string
    items: LeaderboardItem[]
    me: { points: number; rank: number | null }
}

export interface StationDetail extends Station {
    phone: string | null
    working_hours: string | null
    reports: Report[]
}

export interface MetaOption {
    value: string
    label: Record<string, string>
}

export interface FuelMeta {
    fuel_types: MetaOption[]
    statuses: MetaOption[]
    queue_buckets: MetaOption[]
    restrictions: MetaOption[]
    fresh_minutes: number
}

export interface ReportPayload {
    fuel_types: FuelType[]
    status: FuelStatus
    queue?: QueueBucket | null
    /** только при одной марке — общая цена на несколько марок бессмысленна */
    price?: number | null
    restriction?: Restriction | null
    note?: string | null
    /** позиция репортёра в момент отметки (провенанс) */
    location?: { lat: number; lng: number } | null
}

export interface MyReport {
    id: number
    station_id: number
    station_name: string
    fuel_type: FuelType
    status: FuelStatus
    queue: QueueBucket | null
    price: number | null
    created_at: string
}

export type LatLng = { lat: number; lng: number }
