import { requester } from '@doska/shared'
import type { Page } from '@doska/shared'
import { AxiosResponse } from 'axios'

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const requests = {
    get: <T>(url: string) => requester.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => requester.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => requester.put<T>(url, body).then(responseBody),
    patch: <T>(url: string, body: {}) => requester.patch<T>(url, body).then(responseBody),
    delete: <T>(url: string) => requester.delete<T>(url).then(responseBody),
}

export interface AdminRegion {
    id: number
    name: string
    sub_name?: string | null
    kind?: string | null
    parent_id?: number | null
    is_popular?: boolean | null
    latitude?: number | null
    longitude?: number | null
}

export const adminApi = {
    // Regions (geo tree, read-only)
    getRegions: (q?: string) => {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        const qs = params.toString()
        return requests.get<AdminRegion[]>(`/admin/regions/${qs ? `?${qs}` : ''}`)
    },
    // Users
    getUsers: (
        page = 1,
        size = 40,
        q?: string,
        filters?: {
            is_active?: boolean
            gender?: string
            provider?: string
            date_from?: string
            date_to?: string
        },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (filters?.is_active !== undefined) params.set('is_active', String(filters.is_active))
        if (filters?.gender) params.set('gender', filters.gender)
        if (filters?.provider) params.set('provider', filters.provider)
        if (filters?.date_from) params.set('date_from', filters.date_from)
        if (filters?.date_to) params.set('date_to', filters.date_to)
        return requests.get<Page<any>>(`/admin/users/?${params.toString()}`)
    },
    getUser: (id: number) => requests.get<any>(`/admin/users/${id}`),
    searchUsers: (q: string, size = 20) =>
        requests.get<Page<any>>(`/admin/users/?q=${encodeURIComponent(q)}&page=1&size=${size}`),
    banUser: (id: number, isActive: boolean) =>
        requests.put<any>(`/admin/users/${id}/ban?is_active=${isActive}`, {}),
    getUserDevices: (id: number) =>
        requests.get<AdminDeviceToken[]>(`/admin/users/${id}/devices`),
    getUserSessions: (id: number) =>
        requests.get<AdminUserSession[]>(`/admin/users/${id}/sessions`),
    getUserRelatedAccounts: (id: number) =>
        requests.get<{
            devices: Array<{
                device_id: string
                sources: string[]
                platforms: string[]
                first_seen: string | null
                last_seen: string | null
                events: number
            }>
            related: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                is_active: boolean
                registered_at: string | null
                shared_devices: string[]
                first_seen: string | null
                last_seen: string | null
                events: number
            }>
        }>(`/admin/users/${id}/related-accounts`),
    getUserFeatures: (id: number) =>
        requests.get<AdminUserFeatures>(`/admin/users/${id}/features`),
    updateUserFeatures: (id: number, overrides: Record<string, boolean | null>) =>
        requests.put<AdminUserFeatures>(`/admin/users/${id}/features`, { overrides }),
    getUserPreBlockWarning: (id: number) =>
        requests.get<AdminUserPreBlockWarning>(`/admin/users/${id}/pre-block-warning`),
    updateUserPreBlockWarning: (id: number, body: AdminUserPreBlockWarning) =>
        requests.put<AdminUserPreBlockWarning>(`/admin/users/${id}/pre-block-warning`, body),
    getUserTripsSummary: (id: number) =>
        requests.get<AdminUserTripsSummary>(`/admin/users/${id}/trips-summary`),
    getUserWallets: (id: number) =>
        requests.get<{
            wallets: Array<{
                id: number
                name: string
                currency: string
                balance: number
                color: string | null
                icon: string | null
                product: string
                created_at: string
                tx_count: number
            }>
            total_balance_by_currency: Record<string, number>
        }>(`/admin/akcha/users/${id}/wallets`),
    getUserTransactions: (
        id: number,
        page: number = 1,
        size: number = 50,
        opts?: { walletId?: number; type?: string; period?: string },
    ) => {
        const qs = new URLSearchParams({ page: String(page), size: String(size) })
        if (opts?.walletId != null) qs.set('wallet_id', String(opts.walletId))
        if (opts?.type) qs.set('type', opts.type)
        if (opts?.period) qs.set('period', opts.period)
        return requests.get<
            Page<{
                id: number
                wallet_id: number
                wallet_name: string | null
                category_id: number | null
                category_name: string | null
                amount: number
                type: string
                description: string | null
                product: string
                date: string | null
                created_at: string
            }> & {
                summary: {
                    income_by_currency: Record<string, number>
                    expense_by_currency: Record<string, number>
                }
            }
        >(`/admin/akcha/users/${id}/transactions?${qs.toString()}`)
    },

    // Complaints (user reports on trips/users/listings)
    getComplaints: (page = 1, size = 40, filters?: AdminComplaintListParams) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.target_type) params.set('target_type', filters.target_type)
        if (filters?.status) params.set('status', filters.status)
        if (filters?.reason) params.set('reason', filters.reason)
        if (filters?.reporter_id != null) params.set('reporter_id', String(filters.reporter_id))
        if (filters?.target_id != null) params.set('target_id', String(filters.target_id))
        if (filters?.date_from) params.set('date_from', filters.date_from)
        if (filters?.date_to) params.set('date_to', filters.date_to)
        return requests.get<Page<AdminComplaint>>(`/admin/complaints/?${params.toString()}`)
    },
    getComplaint: (id: number) => requests.get<AdminComplaint>(`/admin/complaints/${id}`),
    setComplaintStatus: (id: number, status: AdminComplaintStatus) =>
        requests.put<AdminComplaint>(`/admin/complaints/${id}/status`, { status }),
    deleteComplaint: (id: number) =>
        requests.delete<{ deleted: boolean }>(`/admin/complaints/${id}`),

    // Complaint reasons dictionary (admin-editable, served to the mobile app)
    getComplaintReasons: () =>
        requests.get<AdminComplaintReason[]>('/admin/complaints/reasons'),
    createComplaintReason: (body: AdminComplaintReasonInput) =>
        requests.post<AdminComplaintReason>('/admin/complaints/reasons', body),
    updateComplaintReason: (id: number, body: Partial<AdminComplaintReasonInput>) =>
        requests.put<AdminComplaintReason>(`/admin/complaints/reasons/${id}`, body),
    deleteComplaintReason: (id: number) =>
        requests.delete<{ deleted: boolean }>(`/admin/complaints/reasons/${id}`),
    reorderComplaintReasons: (ids: number[]) =>
        requests.put<AdminComplaintReason[]>('/admin/complaints/reasons/reorder', { ids }),

    // BulBul Go news (in-app articles opened from pushes / home card)
    getNewsList: (page = 1, size = 40, filters?: { q?: string; status?: string }) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.status) params.set('status', filters.status)
        return requests.get<Page<AdminNews>>(`/admin/news/?${params.toString()}`)
    },
    getNews: (id: number) => requests.get<AdminNews>(`/admin/news/${id}`),
    createNews: (body: AdminNewsInput) => requests.post<AdminNews>('/admin/news/', body),
    updateNews: (id: number, body: Partial<AdminNewsInput>) =>
        requests.put<AdminNews>(`/admin/news/${id}`, body),
    deleteNews: (id: number) => requests.delete<{ deleted: boolean }>(`/admin/news/${id}`),

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
    getTrips: (
        page = 1,
        size = 40,
        q?: string,
        status?: string,
        filters?: {
            trip_type?: string
            role?: string
            user_id?: number
            from_location_id?: number
            to_location_id?: number
            price_min?: number
            price_max?: number
            seats_min?: number
            seats_max?: number
            date_from?: string
            date_to?: string
            service?: string
            only_real?: boolean
            include_deleted?: boolean
        },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (status) params.set('status', status)
        if (filters?.service) params.set('service', filters.service)
        if (filters?.include_deleted) params.set('include_deleted', 'true')
        if (filters?.trip_type) params.set('trip_type', filters.trip_type)
        if (filters?.role) params.set('role', filters.role)
        if (filters?.user_id) params.set('user_id', String(filters.user_id))
        if (filters?.from_location_id) params.set('from_location_id', String(filters.from_location_id))
        if (filters?.to_location_id) params.set('to_location_id', String(filters.to_location_id))
        if (filters?.price_min != null) params.set('price_min', String(filters.price_min))
        if (filters?.price_max != null) params.set('price_max', String(filters.price_max))
        if (filters?.seats_min != null) params.set('seats_min', String(filters.seats_min))
        if (filters?.seats_max != null) params.set('seats_max', String(filters.seats_max))
        if (filters?.date_from) params.set('date_from', filters.date_from)
        if (filters?.date_to) params.set('date_to', filters.date_to)
        if (filters?.only_real !== undefined)
            params.set('only_real', String(filters.only_real))
        return requests.get<Page<any>>(`/admin/trips/?${params.toString()}`)
    },
    getTrip: (id: number) => requests.get<any>(`/admin/trips/${id}`),
    setTripServiceUntil: (id: number, body: { service_type: string; until: string }) =>
        requests.post<{
            service_type: string
            until: string
            active: boolean
            admin_edited: boolean
        }>(`/admin/trips/${id}/service-until`, body),
    getTripServicePayments: (id: number) =>
        requests.get<
            Array<{
                id: number
                service_type: string | null
                tariff_id: string | null
                amount: number
                currency: string | null
                description: string | null
                user_id: number
                user_name: string | null
                created_at: string
            }>
        >(`/admin/trips/${id}/service-payments`),
    getTripPhoneViewers: (id: number) =>
        requests.get<{
            trip_id: number
            total_viewers: number
            total_views: number
            viewers: Array<{
                user_id: number | null
                name: string | null
                phone: string | null
                avatar_url: string | null
                views_count: number
                first_viewed_at: string
                last_viewed_at: string
            }>
        }>(`/admin/rideshare/analytics/trips/${id}/phone-viewers`),
    updateTripStatus: (id: number, status: string) =>
        requests.patch<any>(`/admin/trips/${id}/status`, { status }),
    deleteTrip: (id: number) => requests.delete<any>(`/admin/trips/${id}`),

    // Parser author blocklist (Telegram accounts the chat parser skips)
    getBlockedAuthors: () =>
        requests.get<BlockedAuthor[]>(`/admin/trips/blocked-authors`),
    blockAuthor: (payload: {
        author_id: number
        username?: string | null
        name?: string | null
        trip_id?: number | null
    }) => requests.post<BlockedAuthor>(`/admin/trips/blocked-authors`, payload),
    unblockAuthor: (authorId: number) =>
        requests.delete<{ message: string; removed: boolean }>(
            `/admin/trips/blocked-authors/${authorId}`,
        ),

    // Trip subscriptions (saved searches)
    getTripSubscriptions: (
        page = 1,
        size = 40,
        filters?: {
            q?: string
            trip_type?: string
            search_role?: string
            user_id?: number
            is_active?: boolean
            include_deleted?: boolean
        },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.trip_type) params.set('trip_type', filters.trip_type)
        if (filters?.search_role) params.set('search_role', filters.search_role)
        if (filters?.user_id) params.set('user_id', String(filters.user_id))
        if (filters?.is_active !== undefined) params.set('is_active', String(filters.is_active))
        if (filters?.include_deleted) params.set('include_deleted', 'true')
        return requests.get<Page<AdminTripSubscription>>(
            `/admin/rideshare/subscriptions/?${params.toString()}`,
        )
    },
    setTripSubscriptionActive: (id: number, isActive: boolean) =>
        requests.patch<AdminTripSubscription>(`/admin/rideshare/subscriptions/${id}`, {
            is_active: isActive,
        }),
    deleteTripSubscription: (id: number) =>
        requests.delete<any>(`/admin/rideshare/subscriptions/${id}`),

    // Vehicles
    getVehicles: (
        page = 1,
        size = 40,
        q?: string,
        filters?: {
            vehicle_type?: string
            year?: number
            user_id?: number
        },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (filters?.vehicle_type) params.set('vehicle_type', filters.vehicle_type)
        if (filters?.year) params.set('year', String(filters.year))
        if (filters?.user_id) params.set('user_id', String(filters.user_id))
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
        limit: number = 50,
    ) =>
        requests.get<
            Array<{
                user_id: number
                name: string | null
                avatar_url: string | null
                count: number
                first_seen: string
                last_seen: string
            }>
        >(`/admin/promotions/${id}/stats/users?type=${type}&period=${period}&limit=${limit}`),

    // Mobile app services (home hub cards / tabs / webview services)
    getServices: () => requests.get<AdminService[]>('/admin/services/'),
    getService: (id: number) => requests.get<AdminService>(`/admin/services/${id}`),
    createService: (body: AdminServiceCreate) =>
        requests.post<AdminService>('/admin/services/', body),
    updateService: (id: number, body: AdminServiceUpdate) =>
        requests.patch<AdminService>(`/admin/services/${id}`, body),
    deleteService: (id: number) =>
        requests.delete<{ deleted: boolean }>(`/admin/services/${id}`),

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
        requests.get<{ matching: number }>('/admin/analytics/cleanup/preview'),
    runAnalyticsCleanup: () =>
        requests.post<{ task_id: string }>('/admin/analytics/cleanup/run', {}),

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
            active_by_role: Array<{ role: string | null; count: number }>
            created_in_period: number
            completed_in_period: number
            cancelled_in_period: number
            completion_rate: number
        }>(`/admin/rideshare/analytics/summary?period=${period}`),
    getRideshareTripsByDay: (period: string = '7d', groupBy: 'type' | 'role' = 'type') =>
        requests.get<{
            period: string
            from_: string
            to: string
            granularity: 'minute' | 'hour' | 'day'
            group_by: 'type' | 'role'
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            trip_types: string[]
        }>(`/admin/rideshare/analytics/trips-by-day?period=${period}&group_by=${groupBy}`),
    getRideshareInstallsByDay: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            granularity: 'minute' | 'hour' | 'day'
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            event_types: string[]
        }>(`/admin/rideshare/analytics/installs-by-day?period=${period}`),
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
    getRideshareTopActiveUsers: (period: string = '7d', limit: number = 20) =>
        requests.get<{
            period: string
            from_: string
            to: string
            users: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                events: number
                active_days: number
            }>
        }>(`/admin/rideshare/analytics/top-active-users?period=${period}&limit=${limit}`),
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
    getRideshareLimitedDrivers: (
        page: number = 1,
        size: number = 20,
        opts?: {
            tier?: 'strict' | 'general'
            hasCredits?: boolean
            onlyLimitReached?: boolean
            sortBy?:
                | 'window_views'
                | 'free_used'
                | 'credits_balance'
                | 'active_days'
                | 'limit_reached_today'
                | 'last_online_at'
        },
    ) =>
        requests.get<{
            config: {
                enabled: boolean
                free_daily_limit: number
                global_free_daily_limit: number
                fast_cost: number
                activity_window_days: number
                activity_min_views: number
                activity_min_active_days: number
            }
            drivers: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                window_views: number
                active_days: number
                is_limited: boolean
                limit_override: boolean | null
                free_used: number
                free_limit: number
                free_remaining: number
                credits_balance: number
                limit_reached_today: number
                limit_reached_last_at: string | null
                last_online_at: string | null
            }>
            total: number
            page: number
            size: number
        }>(
            `/admin/rideshare/analytics/limited-drivers?page=${page}&size=${size}` +
                (opts?.tier ? `&tier=${opts.tier}` : '') +
                (opts?.hasCredits ? `&has_credits=true` : '') +
                (opts?.onlyLimitReached ? `&only_limit_reached=true` : '') +
                (opts?.sortBy ? `&sort_by=${opts.sortBy}` : ''),
        ),
    // ── BulBul Go wallet reports (product='bulbulgo'), /admin/akcha/reports/* ──
    getWalletReportSummary: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            balance_by_currency: Array<{ currency: string; balance: number }>
            topups_sum: number
            topups_count: number
            spend_sum: number
            spend_count: number
            net_in_period: number
            active_wallets: number
            active_users: number
        }>(`/admin/akcha/reports/summary?period=${period}`),
    getWalletReportFlowByDay: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            granularity: 'minute' | 'hour' | 'day'
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            event_types: string[]
        }>(`/admin/akcha/reports/flow-by-day?period=${period}`),
    getWalletReportTopUsers: (
        period: string = '7d',
        metric: 'topups' | 'spend' | 'balance' = 'topups',
        limit: number = 20,
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            metric: string
            users: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                topups: number
                topups_count: number
                spend: number
                spend_count: number
                balance: number
                last_tx_at: string | null
            }>
        }>(
            `/admin/akcha/reports/top-users?period=${period}&metric=${metric}&limit=${limit}`,
        ),
    getWalletRetention: (granularity: 'week' | 'month' = 'month', cohorts: number = 12) =>
        requests.get<{
            granularity: string
            cohorts: Array<{
                cohort: string
                users: number
                topups_sum: number
                returned: number[]
                max_observable: number
            }>
            max_offset: number
            payers: number
            repeat_payers: number
            repeat_rate: number
            avg_topups_per_payer: number
            median_days_to_second: number | null
        }>(
            `/admin/akcha/reports/retention?granularity=${granularity}&cohorts=${cohorts}`,
        ),
    getRideshareMultiAccountDevices: (
        period: string = '30d',
        page: number = 1,
        size: number = 20,
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            devices: Array<{
                device_id: string
                account_count: number
                events: number
                last_seen: string
                accounts: Array<{
                    user_id: number
                    name: string | null
                    phone: string | null
                    avatar_url: string | null
                    events: number
                    last_seen: string
                }>
            }>
            total: number
            page: number
            size: number
        }>(
            `/admin/rideshare/analytics/multi-account-devices?period=${period}&page=${page}&size=${size}`,
        ),
    getRideshareMultiAccountIps: (
        period: string = '30d',
        page: number = 1,
        size: number = 20,
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            ips: Array<{
                ip_address: string
                account_count: number
                events: number
                last_seen: string
                accounts: Array<{
                    user_id: number
                    name: string | null
                    phone: string | null
                    avatar_url: string | null
                    events: number
                    last_seen: string
                }>
            }>
            total: number
            page: number
            size: number
        }>(
            `/admin/rideshare/analytics/multi-account-ips?period=${period}&page=${page}&size=${size}`,
        ),
    getRideshareTopViewedTrips: (
        page: number = 1,
        size: number = 20,
        filters: { tripType?: string; role?: string; realOnly?: boolean } = {},
    ) =>
        requests.get<{
            total: number
            page: number
            size: number
            trips: Array<{
                trip_id: number
                trip_type: string | null
                role: string
                status: string
                from_name: string | null
                to_name: string | null
                price: number | null
                seats: number | null
                phone_view_count: number
                last_phone_view_at: string | null
                created_at: string
                owner_user_id: number | null
                owner_name: string | null
                owner_phone: string | null
            }>
        }>(
            `/admin/rideshare/analytics/top-viewed-trips?page=${page}&size=${size}` +
                (filters.tripType ? `&trip_type=${filters.tripType}` : '') +
                (filters.role ? `&role=${filters.role}` : '') +
                (filters.realOnly ? `&real_only=true` : ''),
        ),
    getUserLimit: (userId: number) =>
        requests.get<AdminUserLimit>(`/admin/rideshare/analytics/users/${userId}/limit`),
    setDriverCredits: (userId: number, body: { value: number }) =>
        requests.put<{ user_id: number; credits_balance: number }>(
            `/admin/rideshare/analytics/users/${userId}/credits`,
            body,
        ),
    setDriverFreeUsed: (userId: number, body: { value: number }) =>
        requests.put<{
            user_id: number
            free_used: number
            free_limit: number
            free_remaining: number
        }>(`/admin/rideshare/analytics/users/${userId}/free-used`, body),
    setDriverLimited: (userId: number, value: number | null) =>
        requests.put<{ user_id: number; limit_override: boolean | null }>(
            `/admin/rideshare/analytics/users/${userId}/limited`,
            { value },
        ),

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

    // App settings (maintenance mode — Redis key `app:maintenance_mode`)
    getMaintenanceSettings: () =>
        requests.get<AdminMaintenanceSettings>('/admin/settings/maintenance'),
    updateMaintenanceSettings: (body: AdminMaintenanceSettings) =>
        requests.put<AdminMaintenanceSettings>('/admin/settings/maintenance', body),

    // App settings (global feature flags — Redis key `app:features`)
    getAppFeaturesSettings: () =>
        requests.get<AdminAppFeaturesSettings>('/admin/settings/features'),
    updateAppFeaturesSettings: (body: AdminAppFeaturesSettings) =>
        requests.put<AdminAppFeaturesSettings>('/admin/settings/features', body),

    // Driver phone-view rate limits (Redis key `app:contact_limits`)
    getContactLimitsSettings: () =>
        requests.get<AdminContactLimitsSettings>('/admin/settings/contact-limits'),
    updateContactLimitsSettings: (body: AdminContactLimitsSettings) =>
        requests.put<AdminContactLimitsSettings>('/admin/settings/contact-limits', body),

    // Per-user bump rate limit (Redis key `app:bump_limits`)
    getBumpLimitsSettings: () =>
        requests.get<AdminBumpLimitsSettings>('/admin/settings/bump-limits'),
    updateBumpLimitsSettings: (body: AdminBumpLimitsSettings) =>
        requests.put<AdminBumpLimitsSettings>('/admin/settings/bump-limits', body),

    // Per-user active-listings limit (Redis key `app:active_limits`)
    getActiveLimitsSettings: () =>
        requests.get<AdminActiveLimitsSettings>('/admin/settings/active-limits'),
    updateActiveLimitsSettings: (body: AdminActiveLimitsSettings) =>
        requests.put<AdminActiveLimitsSettings>('/admin/settings/active-limits', body),

    // Trip-subscription limits (inside Redis dict `app:settings`)
    getSubscriptionSettings: () =>
        requests.get<AdminSubscriptionSettings>('/admin/settings/subscriptions'),
    updateSubscriptionSettings: (body: AdminSubscriptionSettings) =>
        requests.put<AdminSubscriptionSettings>('/admin/settings/subscriptions', body),

    // Premium-service prices/tariffs (Redis key `app:service_prices`)
    getServicePricesSettings: () =>
        requests.get<AdminServicePrices>('/admin/settings/service-prices'),
    updateServicePricesSettings: (body: AdminServicePrices) =>
        requests.put<AdminServicePrices>('/admin/settings/service-prices', body),

    // Parcel types for courier delivery (Redis key `app:parcel_types`)
    getParcelTypesSettings: () =>
        requests.get<AdminParcelTypesSettings>('/admin/settings/parcel-types'),
    updateParcelTypesSettings: (body: AdminParcelTypesSettings) =>
        requests.put<AdminParcelTypesSettings>('/admin/settings/parcel-types', body),
    getAttractivePricesSettings: () =>
        requests.get<AdminAttractivePricesSettings>('/admin/settings/attractive-prices'),
    updateAttractivePricesSettings: (body: AdminAttractivePricesSettings) =>
        requests.put<AdminAttractivePricesSettings>('/admin/settings/attractive-prices', body),
}

export interface AdminSubscriptionSettings {
    max_count: number
    max_expire_days: number
}

// === Complaints (user reports) ===

export type AdminComplaintTargetType = 'trip' | 'user' | 'listing'
export type AdminComplaintStatus = 'open' | 'resolved' | 'dismissed'

export interface AdminComplaintReporter {
    id: number
    name: string | null
    full_name: string | null
    username: string | null
    phone: string | null
    avatar_url: string | null
}

export interface AdminComplaintTarget {
    type: AdminComplaintTargetType
    id: number
    exists: boolean
    label: string | null
    subtitle: string | null
    owner_id: number | null
}

export interface AdminComplaint {
    id: number
    reporter_id: number | null
    reporter: AdminComplaintReporter | null
    target_type: AdminComplaintTargetType
    target_id: number
    target: AdminComplaintTarget | null
    reason: string
    description: string | null
    status: AdminComplaintStatus
    resolved_at: string | null
    resolved_by_id: number | null
    data: Record<string, any> | null
    created_at: string
}

export interface AdminComplaintListParams {
    q?: string
    target_type?: AdminComplaintTargetType
    status?: AdminComplaintStatus
    reason?: string
    reporter_id?: number
    target_id?: number
    date_from?: string
    date_to?: string
}

// Report screens in the app; the backend accepts any string (open set).
export type AdminComplaintContext = 'rideshare' | 'freight' | 'real_estate' | 'user' | (string & {})

export interface AdminComplaintReason {
    id: number
    text: string
    // Empty array = the reason is shown in every context.
    contexts: AdminComplaintContext[]
    is_active: boolean
    position: number
    created_at: string
}

export interface AdminComplaintReasonInput {
    text: string
    contexts: AdminComplaintContext[]
    is_active: boolean
    position?: number
}

// === BulBul Go news ===

export type AdminNewsStatus = 'draft' | 'published'

export interface AdminNews {
    id: number
    title: string
    status: AdminNewsStatus
    published_at: string | null
    content: string
    cover_url: string | null
    // Computed by the backend: the /webview/news page and the in-app deep
    // link for push notifications.
    public_url: string
    click_action: string
    created_at: string
}

export interface AdminNewsInput {
    title: string
    content: string
    status: AdminNewsStatus
    cover_url?: string | null
}

export interface BlockedAuthor {
    author_id: number
    username: string | null
    name: string | null
    trip_id: number | null
    blocked_by: string | null
    blocked_at: string | null
}

export interface AdminTripSubscription {
    id: number
    user_id: number
    user_name: string | null
    user_phone: string | null
    user_avatar_url: string | null
    from_location_id: number
    from_name: string | null
    to_location_id: number
    to_name: string | null
    trip_type: string | null
    search_role: string
    max_price: number | null
    is_active: boolean
    is_deleted: boolean
    expire_at: string | null
    created_at: string
}

export interface AdminDeviceToken {
    id: number
    device_id: string | null
    device_type: string
    device_info: string | null
    app_version: string | null
    token: string
    created_at: string
}

export interface AdminUserSession {
    id: number
    device_id: string | null
    device_info: string | null
    ip_address: string | null
    app_version: string | null
    last_used_at: string | null
    // Backend serializes `is_deleted`; `is_active` kept for older callers.
    is_active?: boolean
    is_deleted?: boolean
    created_at: string
}

export interface AdminUserTripsSummary {
    total: number
    driver: number
    passenger: number
    active: number
    completed: number
    cancelled: number
    by_type: Array<{ trip_type: string | null; count: number }>
}

export interface AdminUserLimit {
    user_id: number
    enabled: boolean
    window_views: number
    active_days: number
    is_limited: boolean
    limit_override: boolean | null
    effective_limited: boolean
    free_used: number
    free_limit: number
    free_remaining: number
    credits_balance: number
    fast_cost: number
    free_daily_limit: number
    global_free_daily_limit: number
    activity_window_days: number
    activity_min_views: number
    activity_min_active_days: number
}

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
}

export interface AnalyticsCleanupConfig extends AnalyticsCleanupConfigInput {
    available_event_types: string[]
}

export interface AdminAppVersionSettings {
    set_version_header: boolean
    android_min_version: string
    ios_min_version: string
    android_recommended_version: string
    ios_recommended_version: string
    // Legacy — для старых клиентов, читающих GET /version (удалим в будущем).
    android_force_update: boolean
    ios_force_update: boolean
}

export interface AdminMaintenanceSettings {
    enabled: boolean
    message: string
}

export interface AdminAppFeaturesSettings {
    is_wallet_top_up_enabled: boolean
    is_wallet_enabled: boolean
    is_passenger_search_enabled: boolean
    map_route_preview: boolean
    require_verified_phone: boolean
    phone_login_enabled: boolean
}

// Per-user feature-flag overrides. `overrides` holds only the flags explicitly
// set for this user (true/false); everything else inherits `global_features`.
export interface AdminUserFeatures {
    overrides: Record<string, boolean>
    global_features: Record<string, boolean>
}

export interface AdminUserPreBlockWarning {
    enabled: boolean
    message: string | null
    rules_url: string | null
}

export interface AdminAutoBumpTariff {
    id: string
    label: string
    interval_hours: number
    duration_days: number
    price: number
}

export interface AdminUrgentTariff {
    id: string
    label: string
    duration_days: number
    price: number
}

export interface AdminServicePrices {
    auto_bump_enabled: boolean
    auto_bump_title: string
    auto_bump_short_description: string
    auto_bump_description: string
    auto_bump_tariffs: AdminAutoBumpTariff[]
    urgent_enabled: boolean
    urgent_title: string
    urgent_short_description: string
    urgent_description: string
    urgent_tariffs: AdminUrgentTariff[]
    urgent_price: number
    urgent_duration_days: number
}

export interface AdminParcelType {
    code: string
    name: string
    weight_hint: string
    price: number | null
    negotiable: boolean
}

export interface AdminParcelTypesSettings {
    enabled: boolean
    types: AdminParcelType[]
}

export interface AdminAttractiveRoute {
    from_location_id: number
    to_location_id: number
    min_price: number
    max_price: number
}

export interface AdminAttractivePricesSettings {
    enabled: boolean
    routes: AdminAttractiveRoute[]
}

export interface AdminContactLimitsSettings {
    enabled: boolean
    free_daily_limit: number
    global_free_daily_limit: number
    daily_reset_hour: number
    fast_freshness_minutes: number
    fast_cost: number
    activity_window_days: number
    activity_min_views: number
    activity_min_active_days: number
    package_views: number
    package_price: number
    package_currency: string
}

export interface AdminBumpLimitsSettings {
    enabled: boolean
    max_count: number
    window_seconds: number
}

export interface AdminActiveLimitsSettings {
    enabled: boolean
    max_active_total: number
    max_active_per_direction: number
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
    user_ids?: number[] | null
    device_ids?: string[] | null
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

// === Promotions (in-app custom ads) ===

/** Тексты по локали: { ru, ky, en } */
export type LocalizedText = Record<string, string>

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

export interface AdminAdListParams {
    placement?: string
    is_active?: boolean
    q?: string
}

// === Mobile app services (home hub cards / tabs / webview services) ===

export interface AdminServiceNavItem {
    label: LocalizedText
    icon: string
    kind: 'url' | 'route'
    value: string
}

export interface AdminService {
    id: number
    slug: string
    type: 'native' | 'webview'
    position: number
    label: LocalizedText
    description: LocalizedText
    // категория для группировки/фильтра на «Главной»; пусто — «Другое»
    category: LocalizedText
    icon: string | null
    badge: 'new' | 'soon' | null
    show_in_tabs: boolean
    url: string | null
    auth: boolean
    // false — вебвью без нативной шапки (страница рисует свою)
    app_bar: boolean
    nav_items: AdminServiceNavItem[]
    enabled: boolean
    created_at: string | null
}

export interface AdminServiceCreate {
    slug: string
    type: 'native' | 'webview'
    label?: LocalizedText
    description?: LocalizedText
    category?: LocalizedText
    icon?: string | null
    badge?: 'new' | 'soon' | null
    show_in_tabs?: boolean
    url?: string | null
    auth?: boolean
    app_bar?: boolean
    nav_items?: AdminServiceNavItem[]
    enabled?: boolean
    position?: number
}

// slug/type иммутабельны после создания (бэк их игнорирует в PATCH)
export type AdminServiceUpdate = Partial<Omit<AdminServiceCreate, 'slug' | 'type'>>

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
    /** Write-only: set a new bot token. Omit/empty → no change. Never returned. */
    token?: string
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
