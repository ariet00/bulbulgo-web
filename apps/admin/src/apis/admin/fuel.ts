import { requests } from './base'

// Fuel crowdsource (apps/fuel): справочник АЗС (просмотр) + модерация меток.

export interface AdminFuelStation {
    id: number
    name: string
    brand: string | null
    address: string | null
    lat: number
    lng: number
    fuel_types: string[]
    enabled: boolean
    source: string
    created_at: string
}

export interface AdminFuelStationsPage {
    items: AdminFuelStation[]
    total: number
}

export interface AdminFuelReport {
    id: number
    station_id: number
    station_name: string
    user_id: number | null
    fuel_type: string
    status: string
    queue: string | null
    price: number | null
    restriction: string | null
    note: string | null
    location: { lat: number; lng: number } | null
    created_at: string
}

export interface AdminFuelReportsPage {
    items: AdminFuelReport[]
    total: number
}

export interface AdminFuelReportFilters {
    station_id?: number
    user_id?: number
    fuel_type?: string
    status?: string
}

export const fuelAdminApi = {
    getFuelStations: (
        page = 1,
        size = 50,
        filters?: { q?: string; enabled?: boolean },
    ) => {
        const params = new URLSearchParams({
            skip: String((page - 1) * size),
            limit: String(size),
        })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.enabled !== undefined) params.set('enabled', String(filters.enabled))
        return requests.get<AdminFuelStationsPage>(`/admin/fuel/stations?${params}`)
    },
    getFuelReports: (page = 1, size = 50, filters?: AdminFuelReportFilters) => {
        const params = new URLSearchParams({
            skip: String((page - 1) * size),
            limit: String(size),
        })
        for (const [k, v] of Object.entries(filters ?? {})) {
            if (v !== undefined && v !== '') params.set(k, String(v))
        }
        return requests.get<AdminFuelReportsPage>(`/admin/fuel/reports?${params}`)
    },
    deleteFuelReport: (id: number) =>
        requests.delete<{ success: boolean }>(`/admin/fuel/reports/${id}`),
}
