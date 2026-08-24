import type { Page } from '@doska/shared'
import { requests } from './base'

export interface AdminUserEngagement {
    searches: number
    bookings: number
    completed: number
    phone_views_made: number
    phone_views_received: number
    phone_views_fast_made: number
    trip_views_made: number
    trip_views_received: number
}

export interface AdminUserPlatformRow {
    platform: string | null
    app_version: string | null
    events: number
    last_seen: string
}

export interface AdminErrorGroup {
    kind: string | null
    status: string | null
    error_type: string | null
    error_code: string | null
    count: number
    users: number
    paths: number
    sample_path: string | null
    sample_message: string | null
    first_seen: string
    last_seen: string
    is_new: boolean
}

export interface AdminErrorUser {
    user_id: number
    name: string | null
    avatar_url: string | null
    count: number
    last_seen: string
}

export interface AdminErrorSummary {
    total: number
    server: number
    client: number
    validation: number
    users: number
    prev_total: number
    prev_server: number
    prev_client: number
    prev_validation: number
    prev_users: number
}

export interface AdminErrorEvent {
    id: number
    created_at: string
    method: string | null
    path: string | null
    route: string | null
    status: string | null
    message: string | null
    traceback: string | null
    request_id: string | null
    platform: string | null
    app_version: string | null
    user_id: number | null
    user_name: string | null
    device_id: string | null
}

export interface AdminErrorBreakdown {
    paths: Array<{ path: string | null; method: string | null; count: number; users: number }>
    versions: Array<{
        platform: string | null
        app_version: string | null
        count: number
        users: number
    }>
    timeseries: Array<{ bucket: string; count: number }>
}

export interface AdminAppErrorGroup {
    event_type: string
    source: string | null
    error_type: string | null
    fatal: boolean | null
    count: number
    users: number
    devices: number
    sample_message: string | null
    first_seen: string
    last_seen: string
    is_new: boolean
}

export interface AdminAppErrorSummary {
    total: number
    fatal: number
    users: number
    devices: number
    prev_total: number
    prev_fatal: number
}

export interface AdminAppErrorEvent {
    id: number
    created_at: string
    source: string | null
    error_type: string | null
    message: string | null
    stack: string | null
    fatal: boolean | null
    url: string | null
    http_method: string | null
    status: string | null
    response_body: string | null
    os_version: string | null
    platform: string | null
    app_version: string | null
    user_id: number | null
    user_name: string | null
    device_id: string | null
}

export interface AnalyticsCleanupConfigInput {
    enabled: boolean
    retention_days: number
    event_types: string[]
    // Быстрый уровень — шумные события с меньшим сроком хранения.
    fast_retention_days: number
    fast_event_types: string[]
}

export interface AnalyticsCleanupConfig extends AnalyticsCleanupConfigInput {
    available_event_types: string[]
}

export interface AnalyticsPurgeInput {
    event_types: string[]
    before: string // ISO-дата: удалить события старше этой даты
}

export const analyticsAdminApi = {
    // Analytics
    getAnalytics: () => requests.get<any>('/admin/analytics/'),
    listAnalyticsEvents: (params: {
        page?: number
        size?: number
        event_type?: string
        user_id?: number
        platform?: string
        subtype?: string
        device_id?: string
        product?: string
        from?: string
        to?: string
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<Page<any>>(`/admin/analytics/events?${qs.toString()}`)
    },
    getTopAnalyticsEvents: (params: { period?: string; limit?: number; product?: string }) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.limit) qs.set('limit', String(params.limit))
        if (params.product) qs.set('product', params.product)
        return requests.get<Array<{ event_type: string; count: number }>>(
            `/admin/analytics/events/top?${qs.toString()}`,
        )
    },
    getEventAnalyticsSummary: (
        eventType: string,
        params: { period?: string; product?: string; platform?: string; subtype?: string },
    ) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.product) qs.set('product', params.product)
        if (params.platform) qs.set('platform', params.platform)
        if (params.subtype) qs.set('subtype', params.subtype)
        return requests.get<{
            total: number
            users: number
            devices: number
            anonymous: number
            avg_per_user: number
            median_per_user: number
            prev_total: number
            prev_users: number
        }>(`/admin/analytics/events/${encodeURIComponent(eventType)}/summary?${qs.toString()}`)
    },
    getEventAnalyticsTimeseries: (
        eventType: string,
        params: { period?: string; granularity?: string; product?: string; platform?: string; subtype?: string },
    ) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.granularity) qs.set('granularity', params.granularity)
        if (params.product) qs.set('product', params.product)
        if (params.platform) qs.set('platform', params.platform)
        if (params.subtype) qs.set('subtype', params.subtype)
        return requests.get<Array<{ bucket: string; events: number; users: number }>>(
            `/admin/analytics/events/${encodeURIComponent(eventType)}/timeseries?${qs.toString()}`,
        )
    },
    getEventAnalyticsFrequency: (
        eventType: string,
        params: { period?: string; product?: string; platform?: string; subtype?: string },
    ) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.product) qs.set('product', params.product)
        if (params.platform) qs.set('platform', params.platform)
        if (params.subtype) qs.set('subtype', params.subtype)
        return requests.get<Array<{ bucket: string; users: number }>>(
            `/admin/analytics/events/${encodeURIComponent(eventType)}/frequency?${qs.toString()}`,
        )
    },
    getEventAnalyticsHeatmap: (
        eventType: string,
        params: { period?: string; product?: string; platform?: string; subtype?: string },
    ) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.product) qs.set('product', params.product)
        if (params.platform) qs.set('platform', params.platform)
        if (params.subtype) qs.set('subtype', params.subtype)
        return requests.get<Array<{ dow: number; hour: number; events: number }>>(
            `/admin/analytics/events/${encodeURIComponent(eventType)}/heatmap?${qs.toString()}`,
        )
    },
    getEventAnalyticsAudience: (
        eventType: string,
        params: { period?: string; product?: string; platform?: string; subtype?: string },
    ) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.product) qs.set('product', params.product)
        if (params.platform) qs.set('platform', params.platform)
        if (params.subtype) qs.set('subtype', params.subtype)
        return requests.get<{ active: number; new: number; returning: number }>(
            `/admin/analytics/events/${encodeURIComponent(eventType)}/audience?${qs.toString()}`,
        )
    },
    getEventAnalyticsRepeat: (
        eventType: string,
        params: { period?: string; product?: string; platform?: string; subtype?: string },
    ) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.product) qs.set('product', params.product)
        if (params.platform) qs.set('platform', params.platform)
        if (params.subtype) qs.set('subtype', params.subtype)
        return requests.get<{
            cohort: number
            repeated_7d: number
            repeated_30d: number
            median_gap_hours: number | null
        }>(`/admin/analytics/events/${encodeURIComponent(eventType)}/repeat?${qs.toString()}`)
    },
    getEventAnalyticsTopUsers: (
        eventType: string,
        params: { period?: string; limit?: number; product?: string; platform?: string; subtype?: string },
    ) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.limit) qs.set('limit', String(params.limit))
        if (params.product) qs.set('product', params.product)
        if (params.platform) qs.set('platform', params.platform)
        if (params.subtype) qs.set('subtype', params.subtype)
        return requests.get<
            Array<{
                user_id: number
                name: string | null
                avatar_url: string | null
                count: number
                first_seen: string
                last_seen: string
            }>
        >(`/admin/analytics/events/${encodeURIComponent(eventType)}/top-users?${qs.toString()}`)
    },
    getEventSubtypes: (eventType: string, params: { period?: string }) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        return requests.get<Array<{ subtype: string; count: number }>>(
            `/admin/analytics/events/${encodeURIComponent(eventType)}/subtypes?${qs.toString()}`,
        )
    },
    getActiveUsers: (params: { period?: string; granularity?: string; product?: string }) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.granularity) qs.set('granularity', params.granularity)
        if (params.product) qs.set('product', params.product)
        return requests.get<Array<{ bucket: string; users: number }>>(
            `/admin/analytics/users/active?${qs.toString()}`,
        )
    },
    getPlatformsBreakdown: (period: string = '7d', product?: string, eventType?: string) => {
        const qs = new URLSearchParams({ period })
        if (product) qs.set('product', product)
        if (eventType) qs.set('event_type', eventType)
        return requests.get<Array<{ platform: string | null; events: number; users: number }>>(
            `/admin/analytics/platforms?${qs.toString()}`,
        )
    },
    getProductsBreakdown: (period: string = '7d') =>
        requests.get<Array<{ product: string; events: number; users: number }>>(
            `/admin/analytics/products?period=${period}`,
        ),
    getAppVersionsBreakdown: (
        period: string = '7d',
        product?: string,
        platform?: string,
        eventType?: string,
    ) => {
        const qs = new URLSearchParams({ period })
        if (product) qs.set('product', product)
        if (platform) qs.set('platform', platform)
        if (eventType) qs.set('event_type', eventType)
        return requests.get<
            Array<{
                platform: string | null
                app_version: string | null
                events: number
                users: number
            }>
        >(`/admin/analytics/app-versions?${qs.toString()}`)
    },
    getAppVersionsTimeseries: (
        period: string = '30d',
        granularity: string = 'day',
        product?: string,
        platform?: string,
    ) => {
        const qs = new URLSearchParams({ period, granularity })
        if (product) qs.set('product', product)
        if (platform) qs.set('platform', platform)
        return requests.get<
            Array<{
                bucket: string
                app_version: string | null
                users: number
            }>
        >(`/admin/analytics/app-versions/timeseries?${qs.toString()}`)
    },
    getUserAnalyticsEvents: (
        userId: number,
        page = 1,
        size = 100,
        product?: string,
        filters?: { event_type?: string; from_date?: string; to_date?: string },
    ) => {
        const qs = new URLSearchParams({ page: String(page), size: String(size) })
        if (product) qs.set('product', product)
        if (filters?.event_type) qs.set('event_type', filters.event_type)
        if (filters?.from_date) qs.set('from_date', filters.from_date)
        if (filters?.to_date) qs.set('to_date', filters.to_date)
        return requests.get<Page<any>>(
            `/admin/analytics/users/${userId}/events?${qs.toString()}`,
        )
    },
    getUserDailyActivity: (userId: number, period: string = '30d', product?: string) => {
        const qs = new URLSearchParams({ period })
        if (product) qs.set('product', product)
        return requests.get<{
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            event_types: string[]
        }>(`/admin/analytics/users/${userId}/daily-activity?${qs.toString()}`)
    },
    getUserEngagement: (userId: number, period: string = '30d', product?: string) => {
        const qs = new URLSearchParams({ period })
        if (product) qs.set('product', product)
        return requests.get<AdminUserEngagement>(
            `/admin/analytics/users/${userId}/engagement?${qs.toString()}`,
        )
    },
    getUserPlatforms: (userId: number, period: string = '30d', product?: string) => {
        const qs = new URLSearchParams({ period })
        if (product) qs.set('product', product)
        return requests.get<AdminUserPlatformRow[]>(
            `/admin/analytics/users/${userId}/platforms?${qs.toString()}`,
        )
    },
    getErrorsSummary: (params: { period?: string; product?: string; user_id?: number }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<AdminErrorSummary>(`/admin/analytics/errors/summary?${qs.toString()}`)
    },
    getTopErrors: (params: {
        period?: string
        product?: string
        status_class?: string
        user_id?: number
        path?: string
        limit?: number
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<AdminErrorGroup[]>(`/admin/analytics/errors?${qs.toString()}`)
    },
    getErrorsTimeseries: (params: {
        period?: string
        granularity?: string
        product?: string
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<
            Array<{
                bucket: string
                server: number
                client: number
                validation: number
                total: number
                app: number
            }>
        >(`/admin/analytics/errors/timeseries?${qs.toString()}`)
    },
    getErrorsByUser: (params: {
        period?: string
        product?: string
        status_class?: string
        limit?: number
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<AdminErrorUser[]>(`/admin/analytics/errors/by-user?${qs.toString()}`)
    },
    getErrorsByPath: (params: {
        period?: string
        product?: string
        status_class?: string
        limit?: number
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<
            Array<{ path: string | null; method: string | null; count: number; users: number }>
        >(`/admin/analytics/errors/by-path?${qs.toString()}`)
    },
    getErrorsByVersion: (params: {
        period?: string
        product?: string
        status_class?: string
        limit?: number
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<
            Array<{
                platform: string | null
                app_version: string | null
                count: number
                users: number
            }>
        >(`/admin/analytics/errors/by-version?${qs.toString()}`)
    },
    getErrorSignatureUsers: (params: {
        period?: string
        product?: string
        kind?: string | null
        status?: string | null
        error_type?: string | null
        error_code?: string | null
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<AdminErrorUser[]>(`/admin/analytics/errors/users?${qs.toString()}`)
    },
    getErrorSignatureEvents: (params: {
        period?: string
        product?: string
        kind?: string | null
        status?: string | null
        error_type?: string | null
        error_code?: string | null
        limit?: number
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<AdminErrorEvent[]>(`/admin/analytics/errors/events?${qs.toString()}`)
    },
    getErrorSignatureBreakdown: (params: {
        period?: string
        granularity?: string
        product?: string
        kind?: string | null
        status?: string | null
        error_type?: string | null
        error_code?: string | null
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<AdminErrorBreakdown>(
            `/admin/analytics/errors/breakdown?${qs.toString()}`,
        )
    },
    getAppErrorsSummary: (params: { period?: string; product?: string; event_type?: string }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<AdminAppErrorSummary>(
            `/admin/analytics/errors/app/summary?${qs.toString()}`,
        )
    },
    getTopAppErrors: (params: {
        period?: string
        product?: string
        event_type?: string
        fatal?: boolean
        limit?: number
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<AdminAppErrorGroup[]>(`/admin/analytics/errors/app?${qs.toString()}`)
    },
    getAppErrorSignatureEvents: (params: {
        period?: string
        product?: string
        event_type: string
        source?: string | null
        error_type?: string | null
        fatal?: boolean | null
        limit?: number
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<AdminAppErrorEvent[]>(
            `/admin/analytics/errors/app/events?${qs.toString()}`,
        )
    },
    getAppErrorsByVersion: (params: {
        period?: string
        product?: string
        event_type?: string
        fatal?: boolean
        limit?: number
    }) => {
        const qs = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
        })
        return requests.get<
            Array<{
                platform: string | null
                app_version: string | null
                count: number
                users: number
            }>
        >(`/admin/analytics/errors/app/by-version?${qs.toString()}`)
    },
    getAnalyticsMiddlewareToggle: () =>
        requests.get<{ enabled: boolean }>('/admin/analytics/middleware/toggle'),
    setAnalyticsMiddlewareToggle: (enabled: boolean) =>
        requests.post<{ enabled: boolean }>('/admin/analytics/middleware/toggle', { enabled }),

    // Events cleanup (retention)
    getAnalyticsCleanupConfig: () =>
        requests.get<AnalyticsCleanupConfig>('/admin/analytics/cleanup/config'),
    setAnalyticsCleanupConfig: (body: AnalyticsCleanupConfigInput) =>
        requests.put<AnalyticsCleanupConfig>('/admin/analytics/cleanup/config', body),
    getAnalyticsCleanupPreview: () =>
        requests.get<{ matching: number; fast_matching: number }>(
            '/admin/analytics/cleanup/preview',
        ),
    runAnalyticsCleanup: () =>
        requests.post<{ task_id: string }>('/admin/analytics/cleanup/run', {}),
    previewAnalyticsPurge: (body: AnalyticsPurgeInput) =>
        requests.post<{ matching: number }>('/admin/analytics/cleanup/purge/preview', body),
    runAnalyticsPurge: (body: AnalyticsPurgeInput) =>
        requests.post<{ task_id: string }>('/admin/analytics/cleanup/purge', body),
}
