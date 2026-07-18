import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AdminAdListParams, adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

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
    page: number = 1,
    size: number = 10,
) => {
    return useQuery({
        queryKey: [...adminKeys.adStats(id), 'users', type, period, page, size],
        queryFn: () => adminApi.getAdStatsUsers(id, type, period, page, size),
        enabled: !!id,
        placeholderData: keepPreviousData,
    })
}

// === Mobile app services (home hub / tabs / webview) ===
