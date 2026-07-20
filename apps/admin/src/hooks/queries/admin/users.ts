import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminDevices = (
    page: number = 1,
    size: number = 40,
    filters?: { q?: string; status?: string; device_type?: string },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.devices(),
            {
                page,
                size,
                q: filters?.q ?? null,
                status: filters?.status ?? null,
                device_type: filters?.device_type ?? null,
            },
        ],
        queryFn: () => adminApi.getDevices(page, size, filters),
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

export const useAdminUserRelatedAccounts = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.user(id), 'related-accounts'] as const,
        queryFn: () => adminApi.getUserRelatedAccounts(id),
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

export const useAdminUserPreBlockWarning = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.user(id), 'pre-block-warning'] as const,
        queryFn: () => adminApi.getUserPreBlockWarning(id),
        enabled: !!id,
    })
}

export const useAdminUserAppNotice = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.user(id), 'app-notice'] as const,
        queryFn: () => adminApi.getUserAppNotice(id),
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
    opts?: { walletId?: number; type?: string; period?: string },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.user(id),
            'transactions',
            page,
            size,
            opts?.walletId ?? null,
            opts?.type ?? null,
            opts?.period ?? null,
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
