import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

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

// Retention is measured over the whole history, so it deliberately takes no period.

export const useAdminWalletRetention = (
    granularity: 'week' | 'month' = 'month',
    cohorts: number = 12,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'wallet-report', 'retention', granularity, cohorts],
        queryFn: () => adminApi.getWalletRetention(granularity, cohorts),
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

export const useAdminRideshareDemandSupply = (
    period: string = '7d',
    limit: number = 30,
    sortBy: 'searches' | 'empty' = 'searches',
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'demand-supply', period, limit, sortBy],
        queryFn: () => adminApi.getRideshareDemandSupply(period, limit, sortBy),
    })
}

export const useAdminRideshareServicesReport = (period: string = '7d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'services-report', period],
        queryFn: () => adminApi.getRideshareServicesReport(period),
    })
}

export const useAdminRideshareServiceEffect = (
    period: string = '30d',
    windowHours: number = 24,
) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'service-effect', period, windowHours],
        queryFn: () => adminApi.getRideshareServiceEffect(period, windowHours),
    })
}

export const useAdminRideshareOnboardingFunnel = (period: string = '30d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'onboarding-funnel', period],
        queryFn: () => adminApi.getRideshareOnboardingFunnel(period),
    })
}

export const useAdminRideshareRetentionCohorts = (weeks: number = 8) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'retention-cohorts', weeks],
        queryFn: () => adminApi.getRideshareRetentionCohorts(weeks),
    })
}

export const useAdminRidesharePushReport = (period: string = '7d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'push-report', period],
        queryFn: () => adminApi.getRidesharePushReport(period),
    })
}

export const useAdminRideshareTopBumpers = (period: string = '7d', limit: number = 20) => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'top-bumpers', period, limit],
        queryFn: () => adminApi.getRideshareTopBumpers(period, limit),
    })
}

export const useAdminRideshareTopServiceBuyers = (
    period: string = '30d',
    limit: number = 20,
    sortBy: 'spend' | 'activations' = 'spend',
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.analytics(),
            'rideshare',
            'top-service-buyers',
            period,
            limit,
            sortBy,
        ],
        queryFn: () => adminApi.getRideshareTopServiceBuyers(period, limit, sortBy),
    })
}

export const useAdminRideshareEventRetention = (event: string, period: string = '30d') => {
    return useQuery({
        queryKey: [...adminKeys.analytics(), 'rideshare', 'event-retention', event, period],
        queryFn: () => adminApi.getRideshareEventRetention(event, period),
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
