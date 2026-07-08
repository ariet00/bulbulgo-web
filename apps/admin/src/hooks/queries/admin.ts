import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
    AdminAdListParams,
    AdminBroadcastFilters,
    AdminComplaintListParams,
    AdminNotificationListParams,
    adminApi,
} from '@/apis/admin'

export const adminKeys = {
    all: ['admin'] as const,
    users: () => [...adminKeys.all, 'users'] as const,
    user: (id: number) => [...adminKeys.users(), id] as const,
    companies: () => [...adminKeys.all, 'companies'] as const,
    company: (id: number) => [...adminKeys.companies(), id] as const,
    trips: () => [...adminKeys.all, 'trips'] as const,
    trip: (id: number) => [...adminKeys.trips(), id] as const,
    tripPhoneViewers: (id: number) =>
        [...adminKeys.trips(), id, 'phone-viewers'] as const,
    blockedAuthors: () => [...adminKeys.trips(), 'blocked-authors'] as const,
    subscriptions: () => [...adminKeys.all, 'subscriptions'] as const,
    vehicles: () => [...adminKeys.all, 'vehicles'] as const,
    vehicle: (id: number) => [...adminKeys.vehicles(), id] as const,
    properties: () => [...adminKeys.all, 'properties'] as const,
    property: (id: number) => [...adminKeys.properties(), id] as const,
    chats: () => [...adminKeys.all, 'chats'] as const,
    chat: (id: number) => [...adminKeys.chats(), id] as const,
    analytics: () => [...adminKeys.all, 'analytics'] as const,
    bookingBots: (onlyUnlinked: boolean) => [...adminKeys.all, 'booking-bots', onlyUnlinked] as const,
    bookingBot: (id: number) => [...adminKeys.all, 'booking-bot', id] as const,
    celeryTasks: () => [...adminKeys.all, 'celery-tasks'] as const,
    celeryTask: (id: number) => [...adminKeys.celeryTasks(), id] as const,
    notifications: () => [...adminKeys.all, 'notifications'] as const,
    notification: (id: number) => [...adminKeys.notifications(), id] as const,
    ads: () => [...adminKeys.all, 'ads'] as const,
    ad: (id: number) => [...adminKeys.ads(), id] as const,
    adStats: (id: number) => [...adminKeys.ad(id), 'stats'] as const,
    services: () => [...adminKeys.all, 'services'] as const,
    service: (id: number) => [...adminKeys.services(), id] as const,
    appSettings: () => [...adminKeys.all, 'app-settings'] as const,
    regions: (q?: string) => [...adminKeys.all, 'regions', q ?? null] as const,
    complaints: () => [...adminKeys.all, 'complaints'] as const,
    complaint: (id: number) => [...adminKeys.complaints(), id] as const,
    complaintReasons: () => [...adminKeys.all, 'complaint-reasons'] as const,
    news: () => [...adminKeys.all, 'news'] as const,
    newsItem: (id: number) => [...adminKeys.news(), id] as const,
}

export const useAdminRegions = (q?: string) => {
    return useQuery({
        queryKey: adminKeys.regions(q),
        queryFn: () => adminApi.getRegions(q),
        placeholderData: keepPreviousData,
    })
}

export const useAdminUsers = (
    page: number = 1,
    size: number = 40,
    q?: string,
    filters?: {
        is_active?: boolean
        gender?: string
        provider?: string
        date_from?: string
        date_to?: string
    },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.users(),
            {
                page,
                size,
                q: q ?? null,
                is_active: filters?.is_active ?? null,
                gender: filters?.gender ?? null,
                provider: filters?.provider ?? null,
                date_from: filters?.date_from ?? null,
                date_to: filters?.date_to ?? null,
            },
        ],
        queryFn: () => adminApi.getUsers(page, size, q, filters),
    })
}

export const useAdminUserSearch = (q: string, size: number = 20) => {
    return useQuery({
        queryKey: [...adminKeys.users(), 'search', { q, size }],
        queryFn: () => adminApi.searchUsers(q, size),
        enabled: q.length > 0,
    })
}

export const useAdminUser = (id: number) => {
    return useQuery({
        queryKey: adminKeys.user(id),
        queryFn: () => adminApi.getUser(id),
        enabled: !!id,
    })
}

export const useAdminUserDevices = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.user(id), 'devices'] as const,
        queryFn: () => adminApi.getUserDevices(id),
        enabled: !!id,
    })
}

export const useAdminUserSessions = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.user(id), 'sessions'] as const,
        queryFn: () => adminApi.getUserSessions(id),
        enabled: !!id,
    })
}

export const useAdminUserFeatures = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.user(id), 'features'] as const,
        queryFn: () => adminApi.getUserFeatures(id),
        enabled: !!id,
    })
}

export const useAdminUserTripsSummary = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.user(id), 'trips-summary'] as const,
        queryFn: () => adminApi.getUserTripsSummary(id),
        enabled: !!id,
    })
}

export const useAdminUserWallets = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.user(id), 'wallets'] as const,
        queryFn: () => adminApi.getUserWallets(id),
        enabled: !!id,
    })
}

export const useAdminUserTransactions = (
    id: number,
    page: number = 1,
    size: number = 50,
    opts?: { walletId?: number; type?: string },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.user(id),
            'transactions',
            page,
            size,
            opts?.walletId ?? null,
            opts?.type ?? null,
        ] as const,
        queryFn: () => adminApi.getUserTransactions(id, page, size, opts),
        enabled: !!id,
        placeholderData: keepPreviousData,
    })
}

export const useAdminUserEngagement = (
    id: number,
    period: string = '30d',
    product?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'user-engagement', id, period, product ?? null],
        queryFn: () => adminApi.getUserEngagement(id, period, product),
        enabled: !!id,
    })
}

export const useAdminUserLimit = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'user-limit', id],
        queryFn: () => adminApi.getUserLimit(id),
        enabled: !!id,
    })
}

export const useAdminUserPlatforms = (
    id: number,
    period: string = '30d',
    product?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'user-platforms', id, period, product ?? null],
        queryFn: () => adminApi.getUserPlatforms(id, period, product),
        enabled: !!id,
    })
}

export const useAdminComplaints = (
    page: number = 1,
    size: number = 40,
    filters?: AdminComplaintListParams,
) => {
    return useQuery({
        queryKey: [...adminKeys.complaints(), { page, size, ...(filters ?? {}) }],
        queryFn: () => adminApi.getComplaints(page, size, filters),
        placeholderData: keepPreviousData,
    })
}

export const useAdminComplaint = (id: number) => {
    return useQuery({
        queryKey: adminKeys.complaint(id),
        queryFn: () => adminApi.getComplaint(id),
        enabled: !!id,
    })
}

export const useAdminComplaintReasons = () => {
    return useQuery({
        queryKey: adminKeys.complaintReasons(),
        queryFn: () => adminApi.getComplaintReasons(),
    })
}

export const useAdminNewsList = (
    page: number = 1,
    size: number = 40,
    filters?: { q?: string; status?: string },
) => {
    return useQuery({
        queryKey: [...adminKeys.news(), { page, size, ...(filters ?? {}) }],
        queryFn: () => adminApi.getNewsList(page, size, filters),
        placeholderData: keepPreviousData,
    })
}

export const useAdminNews = (id: number) => {
    return useQuery({
        queryKey: adminKeys.newsItem(id),
        queryFn: () => adminApi.getNews(id),
        enabled: !!id,
    })
}

export const useAdminCompanies = (
    page: number = 1,
    size: number = 40,
    q?: string,
    type?: string,
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.companies(),
            { page, size, q: q ?? null, type: type ?? null },
        ],
        queryFn: () => adminApi.getCompanies(page, size, q, type),
    })
}

export const useAdminCompany = (id: number) => {
    return useQuery({
        queryKey: adminKeys.company(id),
        queryFn: () => adminApi.getCompany(id),
        enabled: !!id,
    })
}

export const useAdminTrips = (
    page: number = 1,
    size: number = 40,
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
        only_real?: boolean
    },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.trips(),
            {
                page,
                size,
                q: q ?? null,
                status: status ?? null,
                trip_type: filters?.trip_type ?? null,
                role: filters?.role ?? null,
                user_id: filters?.user_id ?? null,
                from_location_id: filters?.from_location_id ?? null,
                to_location_id: filters?.to_location_id ?? null,
                price_min: filters?.price_min ?? null,
                price_max: filters?.price_max ?? null,
                seats_min: filters?.seats_min ?? null,
                seats_max: filters?.seats_max ?? null,
                date_from: filters?.date_from ?? null,
                date_to: filters?.date_to ?? null,
                only_real: filters?.only_real ?? null,
            },
        ],
        queryFn: () => adminApi.getTrips(page, size, q, status, filters),
    })
}

export const useAdminTrip = (id: number) => {
    return useQuery({
        queryKey: adminKeys.trip(id),
        queryFn: () => adminApi.getTrip(id),
        enabled: !!id,
    })
}

export const useAdminTripSubscriptions = (
    page: number = 1,
    size: number = 40,
    filters?: {
        q?: string
        trip_type?: string
        search_role?: string
        user_id?: number
        is_active?: boolean
        include_deleted?: boolean
    },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.subscriptions(),
            {
                page,
                size,
                q: filters?.q ?? null,
                trip_type: filters?.trip_type ?? null,
                search_role: filters?.search_role ?? null,
                user_id: filters?.user_id ?? null,
                is_active: filters?.is_active ?? null,
                include_deleted: filters?.include_deleted ?? null,
            },
        ],
        queryFn: () => adminApi.getTripSubscriptions(page, size, filters),
        placeholderData: keepPreviousData,
    })
}

export const useAdminTripPhoneViewers = (id: number) => {
    return useQuery({
        queryKey: adminKeys.tripPhoneViewers(id),
        queryFn: () => adminApi.getTripPhoneViewers(id),
        enabled: !!id,
    })
}

export const useAdminBlockedAuthors = () => {
    return useQuery({
        queryKey: adminKeys.blockedAuthors(),
        queryFn: () => adminApi.getBlockedAuthors(),
    })
}

export const useAdminVehicles = (
    page: number = 1,
    size: number = 40,
    q?: string,
    filters?: {
        vehicle_type?: string
        year?: number
        user_id?: number
    },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.vehicles(),
            {
                page,
                size,
                q: q ?? null,
                vehicle_type: filters?.vehicle_type ?? null,
                year: filters?.year ?? null,
                user_id: filters?.user_id ?? null,
            },
        ],
        queryFn: () => adminApi.getVehicles(page, size, q, filters),
    })
}

export const useAdminVehicle = (id: number) => {
    return useQuery({
        queryKey: adminKeys.vehicle(id),
        queryFn: () => adminApi.getVehicle(id),
        enabled: !!id,
    })
}

export const useAdminProperties = (page: number = 1, size: number = 40) => {
    return useQuery({
        queryKey: [...adminKeys.properties(), { page, size }],
        queryFn: () => adminApi.getProperties(page, size),
    })
}

export const useAdminProperty = (id: number) => {
    return useQuery({
        queryKey: adminKeys.property(id),
        queryFn: () => adminApi.getProperty(id),
        enabled: !!id,
    })
}

export const useAdminChats = (
    page: number = 1,
    size: number = 40,
    q?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.chats(), { page, size, q: q ?? null }],
        queryFn: () => adminApi.getChats(page, size, q),
    })
}

export const useAdminChat = (id: number) => {
    return useQuery({
        queryKey: adminKeys.chat(id),
        queryFn: () => adminApi.getChat(id),
        enabled: !!id,
    })
}

export const useAdminAnalytics = () => {
    return useQuery({
        queryKey: adminKeys.analytics(),
        queryFn: () => adminApi.getAnalytics(),
    })
}

export const useAdminAnalyticsEvents = (params: {
    page?: number
    size?: number
    event_type?: string
    user_id?: number
    platform?: string
    product?: string
    from?: string
    to?: string
}) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'events', params],
        queryFn: () => adminApi.listAnalyticsEvents(params),
    })
}

export const useAdminAnalyticsTopEvents = (period: string = '7d', limit: number = 20, product?: string) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'top', period, limit, product ?? null],
        queryFn: () => adminApi.getTopAnalyticsEvents({ period, limit, product }),
    })
}

export const useAdminAnalyticsEventSummary = (
    eventType: string,
    period: string = '7d',
    product?: string,
    platform?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-summary', eventType, period, product ?? null, platform ?? null],
        queryFn: () => adminApi.getEventAnalyticsSummary(eventType, { period, product, platform }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventTimeseries = (
    eventType: string,
    period: string = '7d',
    granularity: string = 'day',
    product?: string,
    platform?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-timeseries', eventType, period, granularity, product ?? null, platform ?? null],
        queryFn: () =>
            adminApi.getEventAnalyticsTimeseries(eventType, { period, granularity, product, platform }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventFrequency = (
    eventType: string,
    period: string = '7d',
    product?: string,
    platform?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-frequency', eventType, period, product ?? null, platform ?? null],
        queryFn: () => adminApi.getEventAnalyticsFrequency(eventType, { period, product, platform }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventHeatmap = (
    eventType: string,
    period: string = '7d',
    product?: string,
    platform?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-heatmap', eventType, period, product ?? null, platform ?? null],
        queryFn: () => adminApi.getEventAnalyticsHeatmap(eventType, { period, product, platform }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventAudience = (
    eventType: string,
    period: string = '7d',
    product?: string,
    platform?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-audience', eventType, period, product ?? null, platform ?? null],
        queryFn: () => adminApi.getEventAnalyticsAudience(eventType, { period, product, platform }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventRepeat = (
    eventType: string,
    period: string = '7d',
    product?: string,
    platform?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-repeat', eventType, period, product ?? null, platform ?? null],
        queryFn: () => adminApi.getEventAnalyticsRepeat(eventType, { period, product, platform }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventTopUsers = (
    eventType: string,
    period: string = '7d',
    limit: number = 20,
    product?: string,
    platform?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-top-users', eventType, period, limit, product ?? null, platform ?? null],
        queryFn: () =>
            adminApi.getEventAnalyticsTopUsers(eventType, { period, limit, product, platform }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsActiveUsers = (period: string = '30d', granularity: string = 'day', product?: string) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'active-users', period, granularity, product ?? null],
        queryFn: () => adminApi.getActiveUsers({ period, granularity, product }),
    })
}

export const useAdminAnalyticsPlatforms = (period: string = '7d', product?: string, eventType?: string) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'platforms', period, product ?? null, eventType ?? null],
        queryFn: () => adminApi.getPlatformsBreakdown(period, product, eventType),
    })
}

export const useAdminAnalyticsErrorsSummary = (
    period: string = '7d',
    product?: string,
    userId?: number,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'errors-summary', period, product ?? null, userId ?? null],
        queryFn: () => adminApi.getErrorsSummary({ period, product, user_id: userId }),
    })
}

export const useAdminAnalyticsTopErrors = (
    period: string = '7d',
    product?: string,
    statusClass?: string,
    userId?: number,
    limit: number = 30,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'errors', period, product ?? null, statusClass ?? null, userId ?? null, limit],
        queryFn: () =>
            adminApi.getTopErrors({ period, product, status_class: statusClass, user_id: userId, limit }),
    })
}

export const useAdminAnalyticsErrorsTimeseries = (
    period: string = '7d',
    granularity: string = 'day',
    product?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'errors-timeseries', period, granularity, product ?? null],
        queryFn: () => adminApi.getErrorsTimeseries({ period, granularity, product }),
    })
}

export const useAdminAnalyticsErrorsByUser = (
    period: string = '7d',
    product?: string,
    statusClass?: string,
    limit: number = 30,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'errors-by-user', period, product ?? null, statusClass ?? null, limit],
        queryFn: () => adminApi.getErrorsByUser({ period, product, status_class: statusClass, limit }),
    })
}

export const useAdminAnalyticsErrorsByPath = (
    period: string = '7d',
    product?: string,
    statusClass?: string,
    limit: number = 30,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'errors-by-path', period, product ?? null, statusClass ?? null, limit],
        queryFn: () => adminApi.getErrorsByPath({ period, product, status_class: statusClass, limit }),
    })
}

export const useAdminAnalyticsErrorsByVersion = (
    period: string = '7d',
    product?: string,
    statusClass?: string,
    limit: number = 30,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'errors-by-version', period, product ?? null, statusClass ?? null, limit],
        queryFn: () => adminApi.getErrorsByVersion({ period, product, status_class: statusClass, limit }),
    })
}

export const useAdminAnalyticsErrorSignatureUsers = (
    signature: {
        kind: string | null
        status: string | null
        error_type: string | null
        error_code: string | null
    } | null,
    period: string = '7d',
    product?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'error-signature-users', signature, period, product ?? null],
        queryFn: () => adminApi.getErrorSignatureUsers({ ...signature!, period, product }),
        enabled: !!signature,
    })
}

export const useAdminAnalyticsProducts = (period: string = '7d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'products', period],
        queryFn: () => adminApi.getProductsBreakdown(period),
    })
}

export const useAdminAnalyticsAppVersions = (
    period: string = '7d',
    product?: string,
    platform?: string,
    eventType?: string,
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.analytics(),
            'app-versions',
            period,
            product ?? null,
            platform ?? null,
            eventType ?? null,
        ],
        queryFn: () => adminApi.getAppVersionsBreakdown(period, product, platform, eventType),
    })
}

export const useAdminAnalyticsAppVersionsTimeseries = (
    period: string = '30d',
    granularity: string = 'day',
    product?: string,
    platform?: string,
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.analytics(),
            'app-versions-timeseries',
            period,
            granularity,
            product ?? null,
            platform ?? null,
        ],
        queryFn: () =>
            adminApi.getAppVersionsTimeseries(period, granularity, product, platform),
    })
}

export const useAdminAnalyticsUserEvents = (
    userId: number,
    page: number = 1,
    size: number = 100,
    product?: string,
    filters?: { event_type?: string; from_date?: string; to_date?: string },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.analytics(),
            'user-events',
            userId,
            page,
            size,
            product ?? null,
            filters?.event_type ?? null,
            filters?.from_date ?? null,
            filters?.to_date ?? null,
        ],
        queryFn: () => adminApi.getUserAnalyticsEvents(userId, page, size, product, filters),
        enabled: !!userId,
        placeholderData: keepPreviousData,
    })
}

export const useAdminUserDailyActivity = (userId: number, period: string = '30d', product?: string) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'user-daily-activity', userId, period, product ?? null],
        queryFn: () => adminApi.getUserDailyActivity(userId, period, product),
        enabled: !!userId,
    })
}

export const useAdminRideshareFunnel = (period: string = '7d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'funnel', period],
        queryFn: () => adminApi.getRideshareFunnel(period),
    })
}

export const useAdminRideshareSummary = (period: string = '7d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'summary', period],
        queryFn: () => adminApi.getRideshareSummary(period),
    })
}

// ── BulBul Go wallet reports ─────────────────────────────────────────────────
export const useAdminWalletReportSummary = (period: string = '7d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'wallet-report', 'summary', period],
        queryFn: () => adminApi.getWalletReportSummary(period),
    })
}

export const useAdminWalletReportFlowByDay = (period: string = '7d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'wallet-report', 'flow-by-day', period],
        queryFn: () => adminApi.getWalletReportFlowByDay(period),
    })
}

export const useAdminWalletReportTopUsers = (
    period: string = '7d',
    metric: 'topups' | 'spend' | 'balance' = 'topups',
    limit: number = 20,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'wallet-report', 'top-users', period, metric, limit],
        queryFn: () => adminApi.getWalletReportTopUsers(period, metric, limit),
    })
}

export const useAdminRideshareTripsByDay = (
    period: string = '7d',
    groupBy: 'type' | 'role' = 'type',
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'trips-by-day', period, groupBy],
        queryFn: () => adminApi.getRideshareTripsByDay(period, groupBy),
    })
}

export const useAdminRideshareInstallsByDay = (period: string = '7d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'installs-by-day', period],
        queryFn: () => adminApi.getRideshareInstallsByDay(period),
    })
}

export const useAdminRideshareTopDrivers = (
    period: string = '7d',
    limit: number = 20,
    sortBy: 'trips_created' | 'phone_views' | 'trip_views' = 'trips_created',
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.analytics(),
            'rideshare',
            'top-drivers',
            period,
            limit,
            sortBy,
        ],
        queryFn: () => adminApi.getRideshareTopDrivers(period, limit, sortBy),
    })
}

export const useAdminRideshareTopActiveUsers = (
    period: string = '7d',
    limit: number = 20,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'top-active-users', period, limit],
        queryFn: () => adminApi.getRideshareTopActiveUsers(period, limit),
    })
}

export const useAdminRideshareTopRoutes = (period: string = '7d', limit: number = 20) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'top-routes', period, limit],
        queryFn: () => adminApi.getRideshareTopRoutes(period, limit),
    })
}

export const useAdminRideshareLimitedDrivers = (
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
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.analytics(),
            'rideshare',
            'limited-drivers',
            page,
            size,
            opts?.tier ?? null,
            opts?.hasCredits ?? false,
            opts?.onlyLimitReached ?? false,
            opts?.sortBy ?? 'window_views',
        ],
        queryFn: () => adminApi.getRideshareLimitedDrivers(page, size, opts),
        placeholderData: keepPreviousData,
    })
}

export const useAdminRideshareMultiAccountDevices = (
    period: string = '30d',
    page: number = 1,
    size: number = 20,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'multi-account-devices', period, page, size],
        queryFn: () => adminApi.getRideshareMultiAccountDevices(period, page, size),
        placeholderData: keepPreviousData,
    })
}

export const useAdminRideshareMultiAccountIps = (
    period: string = '30d',
    page: number = 1,
    size: number = 20,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'multi-account-ips', period, page, size],
        queryFn: () => adminApi.getRideshareMultiAccountIps(period, page, size),
        placeholderData: keepPreviousData,
    })
}

export const useAdminRideshareTopViewedTrips = (
    page: number = 1,
    size: number = 20,
    filters: { tripType?: string; role?: string; realOnly?: boolean } = {},
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.analytics(),
            'rideshare',
            'top-viewed-trips',
            page,
            size,
            filters.tripType ?? null,
            filters.role ?? null,
            filters.realOnly ?? false,
        ],
        queryFn: () => adminApi.getRideshareTopViewedTrips(page, size, filters),
        placeholderData: keepPreviousData,
    })
}

export const useAdminAnalyticsMiddlewareToggle = () => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'middleware-toggle'],
        queryFn: () => adminApi.getAnalyticsMiddlewareToggle(),
    })
}

export const useAdminAnalyticsCleanupConfig = () => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'cleanup-config'],
        queryFn: () => adminApi.getAnalyticsCleanupConfig(),
    })
}

export const useAdminAnalyticsCleanupPreview = () => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'cleanup-preview'],
        queryFn: () => adminApi.getAnalyticsCleanupPreview(),
    })
}

export const useAdminBookingBots = (onlyUnlinked = false) => {
    return useQuery({
        queryKey: adminKeys.bookingBots(onlyUnlinked),
        queryFn: () => adminApi.getBookingBots(onlyUnlinked),
    })
}

export const useAdminBookingBot = (id: number) => {
    return useQuery({
        queryKey: adminKeys.bookingBot(id),
        queryFn: () => adminApi.getBookingBot(id),
        enabled: !!id,
    })
}

export const useAdminCeleryTasks = () => {
    return useQuery({
        queryKey: adminKeys.celeryTasks(),
        queryFn: () => adminApi.listCeleryTasks(),
    })
}

export const useAdminCeleryTask = (id: number) => {
    return useQuery({
        queryKey: adminKeys.celeryTask(id),
        queryFn: () => adminApi.getCeleryTask(id),
        enabled: !!id,
    })
}

export const useAdminNotifications = (
    page: number = 1,
    size: number = 40,
    params?: AdminNotificationListParams,
) => {
    return useQuery({
        queryKey: [...adminKeys.notifications(), { page, size, ...(params ?? {}) }],
        queryFn: () => adminApi.getNotifications(page, size, params),
    })
}

export const useAdminNotification = (id: number) => {
    return useQuery({
        queryKey: adminKeys.notification(id),
        queryFn: () => adminApi.getNotification(id),
        enabled: !!id,
    })
}

export const useAdminNotificationRoles = () => {
    return useQuery({
        queryKey: [...adminKeys.notifications(), 'roles'] as const,
        queryFn: () => adminApi.getNotificationRoles(),
        staleTime: 5 * 60 * 1000,
    })
}

// === Promotions (in-app custom ads) ===

export const useAdminAds = (page = 1, size = 40, params?: AdminAdListParams) => {
    return useQuery({
        queryKey: [...adminKeys.ads(), { page, size, ...(params ?? {}) }],
        queryFn: () => adminApi.getAds(page, size, params),
        placeholderData: keepPreviousData,
    })
}

export const useAdminAd = (id: number) => {
    return useQuery({
        queryKey: adminKeys.ad(id),
        queryFn: () => adminApi.getAd(id),
        enabled: !!id,
    })
}

export const useAdminAdStats = (id: number) => {
    return useQuery({
        queryKey: adminKeys.adStats(id),
        queryFn: () => adminApi.getAdStats(id),
        enabled: !!id,
    })
}

export const useAdminAdStatsDetailed = (id: number, period: string = '30d') => {
    return useQuery({
        queryKey: [...adminKeys.adStats(id), 'detailed', period],
        queryFn: () => adminApi.getAdStatsDetailed(id, period),
        enabled: !!id,
    })
}

export const useAdminAdStatsTimeseries = (
    id: number,
    period: string = '30d',
    granularity: string = 'day',
) => {
    return useQuery({
        queryKey: [...adminKeys.adStats(id), 'timeseries', period, granularity],
        queryFn: () => adminApi.getAdStatsTimeseries(id, period, granularity),
        enabled: !!id,
    })
}

export const useAdminAdStatsBreakdown = (
    id: number,
    by: 'platform' | 'placement',
    period: string = '30d',
) => {
    return useQuery({
        queryKey: [...adminKeys.adStats(id), 'breakdown', by, period],
        queryFn: () => adminApi.getAdStatsBreakdown(id, by, period),
        enabled: !!id,
    })
}

export const useAdminAdStatsUsers = (
    id: number,
    type: 'click' | 'impression',
    period: string = '30d',
    limit: number = 50,
) => {
    return useQuery({
        queryKey: [...adminKeys.adStats(id), 'users', type, period, limit],
        queryFn: () => adminApi.getAdStatsUsers(id, type, period, limit),
        enabled: !!id,
    })
}

// === Mobile app services (home hub / tabs / webview) ===

export const useAdminServices = () => {
    return useQuery({
        queryKey: adminKeys.services(),
        queryFn: () => adminApi.getServices(),
    })
}

export const useAdminService = (id: number) => {
    return useQuery({
        queryKey: adminKeys.service(id),
        queryFn: () => adminApi.getService(id),
        enabled: !!id,
    })
}

export const useAdminPreviewAudience = (
    filters: AdminBroadcastFilters,
    enabled: boolean = true,
) => {
    return useQuery({
        queryKey: [...adminKeys.notifications(), 'audience-preview', filters] as const,
        queryFn: () => adminApi.previewNotificationAudience(filters),
        enabled,
        staleTime: 30 * 1000,
    })
}

export const useAdminScheduledNotifications = (
    page: number = 1,
    size: number = 40,
    params?: { status?: string; kind?: string },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.notifications(),
            'scheduled',
            { page, size, ...(params ?? {}) },
        ] as const,
        queryFn: () => adminApi.getScheduledNotifications(page, size, params),
    })
}

export const useAdminAppVersionSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'version'] as const,
        queryFn: () => adminApi.getAppVersionSettings(),
    })
}

export const useAdminAppFeaturesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'features'] as const,
        queryFn: () => adminApi.getAppFeaturesSettings(),
    })
}

export const useAdminContactLimitsSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'contact-limits'] as const,
        queryFn: () => adminApi.getContactLimitsSettings(),
    })
}

export const useAdminSubscriptionSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'subscriptions'] as const,
        queryFn: () => adminApi.getSubscriptionSettings(),
    })
}

export const useAdminServicePricesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'service-prices'] as const,
        queryFn: () => adminApi.getServicePricesSettings(),
    })
}

export const useAdminParcelTypesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'parcel-types'] as const,
        queryFn: () => adminApi.getParcelTypesSettings(),
    })
}

export const useAdminAttractivePricesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'attractive-prices'] as const,
        queryFn: () => adminApi.getAttractivePricesSettings(),
    })
}
