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

export const adminApi = {
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
        opts?: { walletId?: number; type?: string },
    ) => {
        const qs = new URLSearchParams({ page: String(page), size: String(size) })
        if (opts?.walletId != null) qs.set('wallet_id', String(opts.walletId))
        if (opts?.type) qs.set('type', opts.type)
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
            }>
        >(`/admin/akcha/users/${id}/transactions?${qs.toString()}`)
    },

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
        },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (status) params.set('status', status)
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
        return requests.get<Page<any>>(`/admin/trips/?${params.toString()}`)
    },
    getTrip: (id: number) => requests.get<any>(`/admin/trips/${id}`),
    updateTripStatus: (id: number, status: string) =>
        requests.patch<any>(`/admin/trips/${id}/status`, { status }),
    deleteTrip: (id: number) => requests.delete<any>(`/admin/trips/${id}`),

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
        return requests.get<{
            total: number
            server: number
            client: number
            validation: number
            users: number
        }>(`/admin/analytics/errors/summary?${qs.toString()}`)
    },
    getTopErrors: (params: {
        period?: string
        product?: string
        status_class?: string
        user_id?: number
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
            Array<{ path: string | null; count: number; users: number }>
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
    is_active: boolean
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
}

export interface AdminErrorUser {
    user_id: number
    name: string | null
    avatar_url: string | null
    count: number
    last_seen: string
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

export interface AdminContactLimitsSettings {
    enabled: boolean
    free_daily_limit: number
    global_free_daily_limit: number
    fast_freshness_minutes: number
    fast_cost: number
    activity_window_days: number
    activity_min_views: number
    activity_min_active_days: number
    package_views: number
    package_price: number
    package_currency: string
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
