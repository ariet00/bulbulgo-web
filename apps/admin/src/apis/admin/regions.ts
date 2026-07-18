import { requests } from './base'

export interface AdminRegion {
    id: number
    name: string
    sub_name?: string | null
    kind?: string | null
    parent_id?: number | null
    is_popular?: boolean | null
    latitude?: number | null
    longitude?: number | null
    search?: string | null
}

export interface AdminRegionInput {
    name: string
    kind?: string | null
    parent_id?: number | null
    is_popular?: boolean
    latitude?: number | null
    longitude?: number | null
    search?: string | null
    slug?: string
    code?: string
}

export const regionsAdminApi = {
    // Regions (geo tree)
    getRegions: (q?: string, limit?: number) => {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (limit) params.set('limit', String(limit))
        const qs = params.toString()
        return requests.get<AdminRegion[]>(`/admin/regions/${qs ? `?${qs}` : ''}`)
    },
    getRegion: (id: number) => requests.get<AdminRegion>(`/admin/regions/${id}`),
    createRegion: (body: AdminRegionInput) => requests.post<AdminRegion>('/admin/regions/', body),
    updateRegion: (id: number, body: Partial<AdminRegionInput>) =>
        requests.patch<AdminRegion>(`/admin/regions/${id}`, body),
}
