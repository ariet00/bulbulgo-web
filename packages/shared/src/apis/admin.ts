import { requester } from '../lib/requester'
import { AxiosResponse } from 'axios'

export interface Page<T> {
    items: T[]
    total: number
    page: number
    size: number
}

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const requests = {
    get: <T>(url: string) => requester.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => requester.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => requester.put<T>(url, body).then(responseBody),
    patch: <T>(url: string, body: {}) => requester.patch<T>(url, body).then(responseBody),
    delete: <T>(url: string) => requester.delete<T>(url).then(responseBody),
}

export const adminApi = {
    // Users
    getUsers: (page = 1, size = 40, q?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        return requests.get<Page<any>>(`/admin/users/?${params.toString()}`)
    },
    getUser: (id: number) => requests.get<any>(`/admin/users/${id}`),
    searchUsers: (q: string, size = 20) =>
        requests.get<Page<any>>(`/admin/users/?q=${encodeURIComponent(q)}&page=1&size=${size}`),
    banUser: (id: number, isActive: boolean) =>
        requests.put<any>(`/admin/users/${id}/ban?is_active=${isActive}`, {}),

    // Companies
    getCompanies: (page = 1, size = 40, q?: string, type?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (type) params.set('type', type)
        return requests.get<Page<any>>(`/admin/companies/?${params.toString()}`)
    },
    getCompany: (id: number) => requests.get<any>(`/admin/companies/${id}`),
    createCompany: (body: AdminCompanyCreate) =>
        requests.post<any>('/admin/companies/', body),
    updateCompany: (id: number, body: AdminCompanyUpdate) =>
        requests.patch<any>(`/admin/companies/${id}`, body),
    deleteCompany: (id: number) => requests.delete<any>(`/admin/companies/${id}`),

    // Trips
    getTrips: (page = 1, size = 40, q?: string, status?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (status) params.set('status', status)
        return requests.get<Page<any>>(`/admin/trips/?${params.toString()}`)
    },
    getTrip: (id: number) => requests.get<any>(`/admin/trips/${id}`),
    deleteTrip: (id: number) => requests.delete<any>(`/admin/trips/${id}`),

    // Vehicles
    getVehicles: (page = 1, size = 40, q?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        return requests.get<Page<any>>(`/admin/vehicles/?${params.toString()}`)
    },
    getVehicle: (id: number) => requests.get<any>(`/admin/vehicles/${id}`),
    deleteVehicle: (id: number) => requests.delete<any>(`/admin/vehicles/${id}`),

    // Properties
    getProperties: (page = 1, size = 40) =>
        requests.get<Page<any>>(`/admin/properties/?page=${page}&size=${size}`),
    getProperty: (id: number) => requests.get<any>(`/admin/properties/${id}`),
    createProperty: (data: any) => requests.post<any>('/admin/properties/', data),
    updateProperty: (id: number, data: any) => requests.put<any>(`/admin/properties/${id}`, data),
    deleteProperty: (id: number) => requests.delete<any>(`/admin/properties/${id}`),

    // Chats
    getChats: (page = 1, size = 40, q?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        return requests.get<Page<any>>(`/admin/chats/?${params.toString()}`)
    },
    getChat: (id: number) => requests.get<any>(`/admin/chats/${id}`),

    // Notifications
    getNotifications: (page = 1, size = 40, params?: AdminNotificationListParams) => {
        const qs = new URLSearchParams({ page: String(page), size: String(size) })
        if (params?.q) qs.set('q', params.q)
        if (params?.user_id != null) qs.set('user_id', String(params.user_id))
        if (params?.is_read != null) qs.set('is_read', String(params.is_read))
        if (params?.type) qs.set('type', params.type)
        if (params?.category) qs.set('category', params.category)
        if (params?.source) qs.set('source', params.source)
        if (params?.status) qs.set('status', params.status)
        return requests.get<Page<any>>(`/admin/notifications/?${qs.toString()}`)
    },
    getNotification: (id: number) => requests.get<any>(`/admin/notifications/${id}`),
    sendNotification: (body: AdminSendNotification) =>
        requests.post<{ queued: boolean }>('/admin/notifications/send', body),
    broadcastNotification: (body: AdminBroadcastNotification) =>
        requests.post<{ queued: boolean }>('/admin/notifications/broadcast', body),
    previewNotificationAudience: (filters: AdminBroadcastFilters) =>
        requests.post<AdminAudiencePreview>('/admin/notifications/audience-preview', filters),
    getNotificationRoles: () =>
        requests.get<AdminNotificationRole[]>('/admin/notifications/roles'),
    scheduleNotification: (body: AdminScheduleNotification) =>
        requests.post<AdminScheduledNotification>('/admin/notifications/schedule', body),
    getScheduledNotifications: (
        page = 1,
        size = 40,
        params?: { status?: string; kind?: string },
    ) => {
        const qs = new URLSearchParams({ page: String(page), size: String(size) })
        if (params?.status) qs.set('status', params.status)
        if (params?.kind) qs.set('kind', params.kind)
        return requests.get<Page<AdminScheduledNotification>>(
            `/admin/notifications/scheduled?${qs.toString()}`,
        )
    },
    cancelScheduledNotification: (id: number) =>
        requests.delete<{ cancelled: boolean }>(`/admin/notifications/scheduled/${id}`),
    deleteNotification: (id: number) =>
        requests.delete<any>(`/admin/notifications/${id}`),

    // Analytics
    getAnalytics: () => requests.get<any>('/admin/analytics/'),
    listAnalyticsEvents: (params: {
        page?: number
        size?: number
        event_type?: string
        user_id?: number
        platform?: string
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
    getActiveUsers: (params: { period?: string; granularity?: string; product?: string }) => {
        const qs = new URLSearchParams()
        if (params.period) qs.set('period', params.period)
        if (params.granularity) qs.set('granularity', params.granularity)
        if (params.product) qs.set('product', params.product)
        return requests.get<Array<{ bucket: string; users: number }>>(
            `/admin/analytics/users/active?${qs.toString()}`,
        )
    },
    getPlatformsBreakdown: (period: string = '7d', product?: string) => {
        const qs = new URLSearchParams({ period })
        if (product) qs.set('product', product)
        return requests.get<Array<{ platform: string | null; events: number; users: number }>>(
            `/admin/analytics/platforms?${qs.toString()}`,
        )
    },
    getProductsBreakdown: (period: string = '7d') =>
        requests.get<Array<{ product: string; events: number; users: number }>>(
            `/admin/analytics/products?period=${period}`,
        ),
    getAppVersionsBreakdown: (period: string = '7d', product?: string, platform?: string) => {
        const qs = new URLSearchParams({ period })
        if (product) qs.set('product', product)
        if (platform) qs.set('platform', platform)
        return requests.get<
            Array<{
                platform: string | null
                app_version: string | null
                events: number
                users: number
            }>
        >(`/admin/analytics/app-versions?${qs.toString()}`)
    },
    getUserAnalyticsEvents: (userId: number, page = 1, size = 100, product?: string) => {
        const qs = new URLSearchParams({ page: String(page), size: String(size) })
        if (product) qs.set('product', product)
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
    getAnalyticsMiddlewareToggle: () =>
        requests.get<{ enabled: boolean }>('/admin/analytics/middleware/toggle'),
    setAnalyticsMiddlewareToggle: (enabled: boolean) =>
        requests.post<{ enabled: boolean }>('/admin/analytics/middleware/toggle', { enabled }),

    // Rideshare (bulbul go) — product-specific analytics
    getRideshareFunnel: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            steps: Array<{
                key: string
                label: string
                event_type: string
                events: number
                users: number
            }>
        }>(`/admin/rideshare/analytics/funnel?period=${period}`),
    getRideshareSummary: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            active_now: number
            active_by_type: Array<{ trip_type: string | null; count: number }>
            created_in_period: number
            completed_in_period: number
            cancelled_in_period: number
            completion_rate: number
        }>(`/admin/rideshare/analytics/summary?period=${period}`),
    getRideshareTripsByDay: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            trip_types: string[]
        }>(`/admin/rideshare/analytics/trips-by-day?period=${period}`),
    getRideshareUsersByDay: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            providers: string[]
        }>(`/admin/rideshare/analytics/users-by-day?period=${period}`),
    getRideshareTopDrivers: (
        period: string = '7d',
        limit: number = 20,
        sortBy: 'trips_created' | 'phone_views' | 'trip_views' = 'trips_created',
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            drivers: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                trips: number
                completed: number
                trips_driver: number
                trips_passenger: number
                phone_views_received: number
                phone_views_made: number
                phone_views_made_driver: number
                phone_views_made_passenger: number
                phone_views_fast_made: number
                trip_views_received: number
                trip_views_made: number
                trip_views_made_driver: number
                trip_views_made_passenger: number
            }>
        }>(
            `/admin/rideshare/analytics/top-drivers?period=${period}&limit=${limit}&sort_by=${sortBy}`,
        ),
    getRideshareTopRoutes: (period: string = '7d', limit: number = 20) =>
        requests.get<{
            period: string
            from_: string
            to: string
            routes: Array<{
                from_id: number
                from_name: string | null
                to_id: number
                to_name: string | null
                trips: number
                completed: number
            }>
        }>(`/admin/rideshare/analytics/top-routes?period=${period}&limit=${limit}`),

    // Booking — bots & onboarding
    getBookingBots: (onlyUnlinked = false) =>
        requests.get<BookingBotItem[]>(`/admin/booking/bots?only_unlinked=${onlyUnlinked}`),
    getBookingBot: (id: number) =>
        requests.get<BookingBotItem>(`/admin/booking/bots/${id}`),
    registerBookingBot: (body: {
        slug: string
        token: string
        name?: string
        username?: string
        bot_type?: string
        mini_app_url?: string
    }) => requests.post<BookingBotItem>('/admin/booking/bots', body),
    updateBookingBot: (id: number, body: BookingBotUpdate) =>
        requests.patch<BookingBotUpdateResponse>(`/admin/booking/bots/${id}`, body),
    onboardBooking: (body: BookingOnboardRequest) =>
        requests.post<BookingOnboardResponse>('/admin/booking/onboard', body),
    linkBookingBot: (body: BookingLinkRequest) =>
        requests.post<BookingLinkResponse>('/admin/booking/link', body),

    // Celery beat — periodic tasks
    listCeleryTasks: () =>
        requests.get<CeleryPeriodicTask[]>('/admin/celery/periodic-tasks'),
    getCeleryTask: (id: number) =>
        requests.get<CeleryPeriodicTask>(`/admin/celery/periodic-tasks/${id}`),
    createCeleryTask: (body: CeleryPeriodicTaskCreate) =>
        requests.post<CeleryPeriodicTask>('/admin/celery/periodic-tasks', body),
    updateCeleryTask: (id: number, body: CeleryPeriodicTaskUpdate) =>
        requests.patch<CeleryPeriodicTask>(`/admin/celery/periodic-tasks/${id}`, body),
    deleteCeleryTask: (id: number) =>
        requests.delete<any>(`/admin/celery/periodic-tasks/${id}`),
    refreshCeleryBeat: () =>
        requests.post<{ ok: boolean; reason?: string }>('/admin/celery/refresh-beat', {}),

    // App settings (mobile-app version gating)
    getAppVersionSettings: () =>
        requests.get<AdminAppVersionSettings>('/admin/settings/version'),
    updateAppVersionSettings: (body: AdminAppVersionSettings) =>
        requests.put<AdminAppVersionSettings>('/admin/settings/version', body),

    // App settings (global feature flags — Redis key `app:features`)
    getAppFeaturesSettings: () =>
        requests.get<AdminAppFeaturesSettings>('/admin/settings/features'),
    updateAppFeaturesSettings: (body: AdminAppFeaturesSettings) =>
        requests.put<AdminAppFeaturesSettings>('/admin/settings/features', body),
}

export interface AdminAppVersionSettings {
    set_version_header: boolean
    android_min_version: string
    ios_min_version: string
    android_force_update: boolean
    ios_force_update: boolean
}

export interface AdminAppFeaturesSettings {
    is_wallet_top_up_enabled: boolean
    is_wallet_enabled: boolean
    is_passenger_search_enabled: boolean
    map_route_preview: boolean
}

export interface AdminNotificationListParams {
    q?: string
    user_id?: number
    is_read?: boolean
    type?: string
    category?: string
    source?: string
    status?: string
}

export interface AdminSendNotification {
    user_id: number
    title: string
    body: string
    type?: string
    category?: string
    click_action?: string
    is_data_only?: boolean
    data?: Record<string, any>
}

export interface AdminBroadcastFilters {
    role_id?: number | null
    is_active?: boolean | null
    device_type?: string | null
    min_version?: string | null
    max_version?: string | null
    guests_only?: boolean | null
}

export interface AdminBroadcastNotification {
    title: string
    body: string
    type?: string
    category?: string
    data?: Record<string, any>
    click_action?: string
    is_data_only?: boolean
    filters?: AdminBroadcastFilters
}

export interface AdminAudiencePreview {
    users: number
    devices: number
    guests: number
    by_device_type: Record<string, number>
}

export interface AdminNotificationRole {
    id: number
    name: string
    slug: string
    category: string | null
}

export type AdminScheduleKind = 'user' | 'broadcast'
export type AdminScheduleStatus = 'pending' | 'sent' | 'cancelled' | 'failed'

export interface AdminScheduleNotification {
    kind: AdminScheduleKind
    scheduled_at: string // ISO datetime
    title: string
    body: string
    type?: string
    category?: string
    click_action?: string
    is_data_only?: boolean
    data?: Record<string, any>
    user_id?: number | null
    filters?: AdminBroadcastFilters | null
}

export interface AdminScheduledNotification {
    id: number
    kind: AdminScheduleKind
    status: AdminScheduleStatus
    user_id: number | null
    scheduled_at: string
    created_at: string
    title: string
    body: string
    type: string
    category: string | null
    click_action: string | null
    is_data_only: boolean
    payload_data: Record<string, any>
    filters: AdminBroadcastFilters | null
    created_by_id: number | null
    sent_at: string | null
    error: string | null
}

export interface BookingBotItem {
    bot_id: number
    bot_slug: string
    bot_name: string | null
    bot_username: string | null
    bot_type: string | null
    mini_app_url: string | null
    is_active: boolean
    company_id: number | null
    company_slug: string | null
    company_name: string | null
    company_type: string | null
    company_status: string | null
    owner_id: number | null
    owner_username: string | null
    owner_name: string | null
    owner_phone: string | null
}

export interface BookingOnboardRequest {
    owner_user_id: number
    name: string
    slug: string
    description?: string
    bot_token: string
    bot_name?: string
    timezone?: string
    currency?: string
}

export interface BookingOnboardResponse {
    company_id: number
    bot_id: number
    bot_slug: string
    webhook_set: boolean
}

export interface BookingLinkRequest {
    bot_slug: string
    owner_user_id: number
    company_name: string
    company_slug?: string
    description?: string
    timezone?: string
    currency?: string
}

export interface BookingLinkResponse {
    company_id: number
    bot_id: number
    bot_slug: string
    created_company: boolean
    settings_created: boolean
    schedule_created: boolean
}

export interface BookingBotUpdate {
    name?: string
    username?: string
    is_active?: boolean
    /** 0 → unlink, >0 → link/move, omit → no change */
    company_id?: number | null
    bot_type?: string
    /** Empty string clears it. */
    mini_app_url?: string
}

export interface BookingBotUpdateResponse {
    bot: BookingBotItem
    needs_booking_settings: boolean
}

export interface AdminCompanyCreate {
    owner_user_id: number
    name: string
    slug: string
    type: string
    category?: string
    description?: string
    status?: string
    legal_form?: 'ip' | 'legal'
    timezone?: string
    currency?: string
    default_working_start?: string
    default_working_end?: string
}

export interface AdminCompanyUpdate {
    owner_user_id?: number
    name?: string
    slug?: string
    description?: string
    status?: string
    type?: string
    category?: string
    legal_form?: 'ip' | 'legal'
}

// === Celery beat ===

export interface CeleryCrontab {
    id?: number | null
    minute: string
    hour: string
    day_of_week: string
    day_of_month: string
    month_of_year: string
    timezone: string
}

export interface CeleryInterval {
    id?: number | null
    every: number
    period: 'seconds' | 'minutes' | 'hours' | 'days'
}

export interface CeleryPeriodicTask {
    id: number
    name: string
    task: string
    args: string
    kwargs: string
    queue: string | null
    enabled: boolean
    one_off: boolean
    expire_seconds: number | null
    last_run_at: string | null
    total_run_count: number
    date_changed: string | null
    description: string | null
    crontab: CeleryCrontab | null
    interval: CeleryInterval | null
}

export interface CeleryPeriodicTaskCreate {
    name: string
    task: string
    args?: string
    kwargs?: string
    queue?: string | null
    enabled?: boolean
    one_off?: boolean
    description?: string | null
    crontab?: CeleryCrontab | null
    interval?: CeleryInterval | null
}

export interface CeleryPeriodicTaskUpdate {
    name?: string
    task?: string
    args?: string
    kwargs?: string
    queue?: string | null
    enabled?: boolean
    one_off?: boolean
    description?: string | null
    crontab?: CeleryCrontab | null
    interval?: CeleryInterval | null
}
