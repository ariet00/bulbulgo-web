import type { Page } from '@doska/shared'
import { requests } from './base'
import type { LocalizedText } from './base'

export interface AdminAdColors {
    background: string
    text: string
    button: string
    button_text: string
}

export interface AdminAdTargeting {
    regions: number[]
    trip_types: string[]
    roles: string[]
    platforms: string[]
    min_app_version?: string | null
}

export interface AdminAd {
    id: number
    placement: string
    image_url: string | null
    action_url: string | null
    action_type: string
    google_in_rotation: boolean
    title: LocalizedText
    button_label: LocalizedText
    colors: AdminAdColors
    colors_dark: AdminAdColors | null
    is_active: boolean
    sort_order: number
    starts_at: string | null
    ends_at: string | null
    targeting: AdminAdTargeting
    created_at: string | null
}

export interface AdminAdCreate {
    placement: string
    image_url?: string
    action_url?: string
    action_type?: string
    google_in_rotation?: boolean
    title?: LocalizedText
    button_label?: LocalizedText
    colors?: AdminAdColors
    colors_dark?: AdminAdColors | null
    targeting?: AdminAdTargeting
    is_active?: boolean
    sort_order?: number
    starts_at?: string | null
    ends_at?: string | null
}

export type AdminAdUpdate = Partial<AdminAdCreate>

export interface AdminAdStats {
    impressions: number
    clicks: number
    ctr: number
}

export interface AdminAdStatsUserRow {
    user_id: number
    name: string | null
    avatar_url: string | null
    count: number
    first_seen: string
    last_seen: string
}

export interface AdminAdListParams {
    placement?: string
    is_active?: boolean
    q?: string
}

// === Mobile app services (home hub cards / tabs / webview services) ===

export const promotionsAdminApi = {
    // Promotions (in-app custom ads)
    getAds: (page = 1, size = 40, params?: AdminAdListParams) => {
        const qs = new URLSearchParams({ page: String(page), size: String(size) })
        if (params?.placement) qs.set('placement', params.placement)
        if (params?.is_active != null) qs.set('is_active', String(params.is_active))
        if (params?.q) qs.set('q', params.q)
        return requests.get<Page<AdminAd>>(`/admin/promotions/?${qs.toString()}`)
    },
    getAd: (id: number) => requests.get<AdminAd>(`/admin/promotions/${id}`),
    createAd: (body: AdminAdCreate) => requests.post<AdminAd>('/admin/promotions/', body),
    updateAd: (id: number, body: AdminAdUpdate) =>
        requests.patch<AdminAd>(`/admin/promotions/${id}`, body),
    deleteAd: (id: number) => requests.delete<{ deleted: boolean }>(`/admin/promotions/${id}`),
    getAdStats: (id: number, params?: { from?: string; to?: string }) => {
        const qs = new URLSearchParams()
        if (params?.from) qs.set('from', params.from)
        if (params?.to) qs.set('to', params.to)
        const s = qs.toString()
        return requests.get<AdminAdStats>(`/admin/promotions/${id}/stats${s ? `?${s}` : ''}`)
    },
    getAdStatsDetailed: (id: number, period: string = '30d') =>
        requests.get<{
            impressions: number
            clicks: number
            ctr: number
            impression_users: number
            impression_devices: number
            click_users: number
            click_devices: number
            anonymous_clicks: number
        }>(`/admin/promotions/${id}/stats/detailed?period=${period}`),
    getAdStatsTimeseries: (id: number, period: string = '30d', granularity: string = 'day') =>
        requests.get<Array<{ bucket: string; impressions: number; clicks: number }>>(
            `/admin/promotions/${id}/stats/timeseries?period=${period}&granularity=${granularity}`,
        ),
    getAdStatsBreakdown: (id: number, by: 'platform' | 'placement', period: string = '30d') =>
        requests.get<
            Array<{ value: string | null; impressions: number; clicks: number; ctr: number }>
        >(`/admin/promotions/${id}/stats/breakdown?by=${by}&period=${period}`),
    getAdStatsUsers: (
        id: number,
        type: 'click' | 'impression',
        period: string = '30d',
        page: number = 1,
        size: number = 10,
    ) =>
        requests.get<Page<AdminAdStatsUserRow>>(
            `/admin/promotions/${id}/stats/users?type=${type}&period=${period}&page=${page}&size=${size}`,
        ),
}
