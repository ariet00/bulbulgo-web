import type { Page } from '@doska/shared'
import { requests } from './base'

export interface AdminDeviceToken {
    id: number
    device_id: string | null
    device_type: string
    device_info: string | null
    app_version: string | null
    token: string
    // active | logged_out | banned
    status: string
    rooted?: boolean | null
    installer_store?: string | null
    created_at: string
}

// Строка глобального реестра устройств (страница «Устройства»).
export interface AdminDeviceListItem {
    id: number
    user_id: number | null
    user_name: string | null
    user_phone: string | null
    device_id: string | null
    device_type: string
    device_info: string | null
    app_version: string | null
    token: string | null
    push_permission: string | null
    // active | logged_out | banned
    status: string
    rooted: boolean | null
    installer_store: string | null
    created_at: string
}

export interface AdminUserSession {
    id: number
    device_id: string | null
    device_info: string | null
    ip_address: string | null
    app_version: string | null
    last_used_at: string | null
    // active | revoked
    status: string
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

export interface AdminUserFeatures {
    overrides: Record<string, boolean>
    global_features: Record<string, boolean>
}

// Legacy: заменено универсальным AdminUserAppNotice; удалить после поднятия
// минимальной версии приложения.
export interface AdminUserPreBlockWarning {
    enabled: boolean
    message: string | null
    rules_url: string | null
}

// Универсальный полноэкранный экран-уведомление в приложении (предупреждение,
// «заполните данные», «пройдите идентификацию» и т.п.).
export interface AdminUserAppNotice {
    enabled: boolean
    kind: 'warning' | 'info'
    title: string | null
    message: string | null
    action_route: string | null
    action_label: string | null
    url: string | null
    dismissible: boolean
    max_shows: number | null
    show_interval_hours: number | null
}

export const usersAdminApi = {
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
    getDevices: (
        page = 1,
        size = 40,
        filters?: { q?: string; status?: string; device_type?: string },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.status) params.set('status', filters.status)
        if (filters?.device_type) params.set('device_type', filters.device_type)
        return requests.get<Page<AdminDeviceListItem>>(`/admin/users/devices?${params.toString()}`)
    },
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
            // Чужие девайсы с похожим data.profile — подсказка при потере
            // device_id (factory reset); прямой связи по device_id нет.
            similar_devices: Array<{
                device_id: string | null
                device_info: string | null
                user_id: number | null
                user_name: string | null
                user_phone: string | null
                user_avatar_url: string | null
                user_is_active: boolean
                match_percent: number
                matched_fields: string[]
                rooted: boolean | null
                ip_subnets: string[]
                last_seen: string | null
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
    getUserAppNotice: (id: number) =>
        requests.get<AdminUserAppNotice>(`/admin/users/${id}/notice`),
    updateUserAppNotice: (id: number, body: AdminUserAppNotice) =>
        requests.put<AdminUserAppNotice>(`/admin/users/${id}/notice`, body),
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
}
