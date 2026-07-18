import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

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
    subtype?: string
    device_id?: string
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
    subtype?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-summary', eventType, period, product ?? null, platform ?? null, subtype ?? null],
        queryFn: () => adminApi.getEventAnalyticsSummary(eventType, { period, product, platform, subtype }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventTimeseries = (
    eventType: string,
    period: string = '7d',
    granularity: string = 'day',
    product?: string,
    platform?: string,
    subtype?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-timeseries', eventType, period, granularity, product ?? null, platform ?? null, subtype ?? null],
        queryFn: () =>
            adminApi.getEventAnalyticsTimeseries(eventType, { period, granularity, product, platform, subtype }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventFrequency = (
    eventType: string,
    period: string = '7d',
    product?: string,
    platform?: string,
    subtype?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-frequency', eventType, period, product ?? null, platform ?? null, subtype ?? null],
        queryFn: () => adminApi.getEventAnalyticsFrequency(eventType, { period, product, platform, subtype }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventHeatmap = (
    eventType: string,
    period: string = '7d',
    product?: string,
    platform?: string,
    subtype?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-heatmap', eventType, period, product ?? null, platform ?? null, subtype ?? null],
        queryFn: () => adminApi.getEventAnalyticsHeatmap(eventType, { period, product, platform, subtype }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventAudience = (
    eventType: string,
    period: string = '7d',
    product?: string,
    platform?: string,
    subtype?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-audience', eventType, period, product ?? null, platform ?? null, subtype ?? null],
        queryFn: () => adminApi.getEventAnalyticsAudience(eventType, { period, product, platform, subtype }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventRepeat = (
    eventType: string,
    period: string = '7d',
    product?: string,
    platform?: string,
    subtype?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-repeat', eventType, period, product ?? null, platform ?? null, subtype ?? null],
        queryFn: () => adminApi.getEventAnalyticsRepeat(eventType, { period, product, platform, subtype }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventTopUsers = (
    eventType: string,
    period: string = '7d',
    limit: number = 20,
    product?: string,
    platform?: string,
    subtype?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-top-users', eventType, period, limit, product ?? null, platform ?? null, subtype ?? null],
        queryFn: () =>
            adminApi.getEventAnalyticsTopUsers(eventType, { period, limit, product, platform, subtype }),
        enabled: !!eventType,
    })
}

export const useAdminAnalyticsEventSubtypes = (eventType: string, period: string = '7d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'event-subtypes', eventType, period],
        queryFn: () => adminApi.getEventSubtypes(eventType, { period }),
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
    path?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'errors', period, product ?? null, statusClass ?? null, userId ?? null, limit, path ?? null],
        queryFn: () =>
            adminApi.getTopErrors({ period, product, status_class: statusClass, user_id: userId, limit, path }),
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

export const useAdminAnalyticsErrorSignatureEvents = (
    signature: {
        kind: string | null
        status: string | null
        error_type: string | null
        error_code: string | null
    } | null,
    period: string = '7d',
    product?: string,
    limit: number = 50,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'error-signature-events', signature, period, product ?? null, limit],
        queryFn: () => adminApi.getErrorSignatureEvents({ ...signature!, period, product, limit }),
        enabled: !!signature,
    })
}

export const useAdminAnalyticsErrorSignatureBreakdown = (
    signature: {
        kind: string | null
        status: string | null
        error_type: string | null
        error_code: string | null
    } | null,
    period: string = '7d',
    granularity: string = 'day',
    product?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'error-signature-breakdown', signature, period, granularity, product ?? null],
        queryFn: () =>
            adminApi.getErrorSignatureBreakdown({ ...signature!, period, granularity, product }),
        enabled: !!signature,
    })
}

export const useAdminAnalyticsAppErrorsSummary = (
    period: string = '7d',
    product?: string,
    eventType?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'app-errors-summary', period, product ?? null, eventType ?? null],
        queryFn: () => adminApi.getAppErrorsSummary({ period, product, event_type: eventType }),
    })
}

export const useAdminAnalyticsTopAppErrors = (
    period: string = '7d',
    product?: string,
    eventType?: string,
    fatal?: boolean,
    limit: number = 30,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'app-errors', period, product ?? null, eventType ?? null, fatal ?? null, limit],
        queryFn: () =>
            adminApi.getTopAppErrors({ period, product, event_type: eventType, fatal, limit }),
    })
}

export const useAdminAnalyticsAppErrorSignatureEvents = (
    signature: {
        event_type: string
        source: string | null
        error_type: string | null
        fatal: boolean | null
    } | null,
    period: string = '7d',
    product?: string,
    limit: number = 50,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'app-error-signature-events', signature, period, product ?? null, limit],
        queryFn: () => adminApi.getAppErrorSignatureEvents({ ...signature!, period, product, limit }),
        enabled: !!signature,
    })
}

export const useAdminAnalyticsAppErrorsByVersion = (
    period: string = '7d',
    product?: string,
    eventType?: string,
    fatal?: boolean,
    limit: number = 30,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'app-errors-by-version', period, product ?? null, eventType ?? null, fatal ?? null, limit],
        queryFn: () =>
            adminApi.getAppErrorsByVersion({ period, product, event_type: eventType, fatal, limit }),
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
