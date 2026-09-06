import type { Page } from '@doska/shared'
import { requests } from './base'

export interface AdminDeviceToken {
    id: number
    device_id: string | null
    device_type: string
    device_info: string | null
    app_version: string | null
    // null — устройство есть, а пуш-токена нет (пуш запрещён / нет Play Services)
    token: string | null
    push_permission?: string | null
    // Ответ ОС на гео — тот же словарь статусов, что и у пуша
    location_permission?: string | null
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
    location_permission: string | null
    // active | logged_out | banned
    status: string
    rooted: boolean | null
    installer_store: string | null
    created_at: string
}

export interface AdminDeviceSessionItem {
    id: number
    user_id: number
    ip_address: string | null
    last_used_at: string | null
    // active | revoked
    status: string
    created_at: string
}

// Полная карточка устройства (детальная страница).
export interface AdminDeviceDetail extends AdminDeviceListItem {
    data: Record<string, unknown>
    sessions: AdminDeviceSessionItem[]
    // Способы входа, точечно отключённые для этого устройства (поверх
    // глобальных тумблеров в «Фичи», см. FeatureFlagsSettingsForm).
    login_methods_disabled: LoginMethod[]
    // Стартовый экран, форсированный для этого устройства (поверх глобальной
    // фичи в «Фичи» и личного выбора юзера) — null, если не задан.
    start_screen_override: StartScreenOverride | null
}

// Стартовый экран, форсированный на конкретное устройство — карточка
// устройства в «Устройствах»; синхронизировано с backend
// apps.users.models.device.START_SCREEN_VALUES.
export const START_SCREEN_VALUES = ['home', 'first_tab'] as const
export type StartScreenOverride = (typeof START_SCREEN_VALUES)[number]
export const START_SCREEN_LABELS: Record<StartScreenOverride, string> = {
    home: 'Главная',
    first_tab: 'Первая вкладка',
}

// Способы входа, которые можно точечно отключить для устройства (карточка
// «Способы входа» на /admin/devices/[id]) — синхронизировано с backend
// apps.users.models.device.LOGIN_METHODS.
export const LOGIN_METHODS = ['phone', 'google', 'apple'] as const
export type LoginMethod = (typeof LOGIN_METHODS)[number]
export const LOGIN_METHOD_LABELS: Record<LoginMethod, string> = {
    phone: 'Телефон (SMS)',
    google: 'Google',
    apple: 'Apple',
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

// Строка реестра забаненных идентификаторов (номера/почты).
export interface AdminBannedIdentifier {
    id: number
    // phone | email
    type: string
    value: string
    // banned_for_user_id (бан вместе с аккаунтом) либо banned_by_admin_id + reason
    data: Record<string, any>
    created_at: string
}

// Группа реестра: идентификаторы одного забаненного аккаунта (user_id может
// указывать на уже удалённый — тогда user_name null) либо один ручной бан
// (user_id null). Пагинация списка — по группам.
export interface AdminBannedIdentifierGroup {
    user_id: number | null
    user_name: string | null
    identifiers: AdminBannedIdentifier[]
}

// Ручная корректировка баланса из карточки пользователя
// (POST /admin/akcha/users/{id}/balance).
export type AdminBalanceDirection = 'income' | 'expense'

export const BALANCE_DIRECTION_LABELS: Record<AdminBalanceDirection, string> = {
    income: 'Начислить',
    expense: 'Списать',
}

export interface AdminBalanceAdjustBody {
    amount: number
    type?: AdminBalanceDirection
    // Кошелёк из списка пользователя; без него бэкенд возьмёт дефолтный кошелёк продукта.
    wallet_id?: number
    product?: string
    comment?: string
    notify?: boolean
    // Разрешить списанию увести баланс в минус.
    allow_negative?: boolean
}

export interface AdminBalanceAdjustResult {
    transaction_id: number
    wallet_id: number
    wallet_name: string
    currency: string
    balance: number
    amount: number
    type: AdminBalanceDirection
    notified: boolean
}

export const usersAdminApi = {
    // Users
    getUsers: (
        page = 1,
        size = 40,
        q?: string,
        filters?: {
            // active | banned
            status?: string
            gender?: string
            provider?: string
            phone_verified?: boolean
            date_from?: string
            date_to?: string
        },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (filters?.status) params.set('status', filters.status)
        if (filters?.gender) params.set('gender', filters.gender)
        if (filters?.provider) params.set('provider', filters.provider)
        if (filters?.phone_verified !== undefined)
            params.set('phone_verified', String(filters.phone_verified))
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
    getDevice: (id: number) =>
        requests.get<AdminDeviceDetail>(`/admin/users/devices/${id}`),
    banDevice: (id: number, status: 'active' | 'banned') =>
        requests.put<AdminDeviceToken>(`/admin/users/devices/${id}/ban?status=${status}`, {}),
    // disabled — способы входа, ЗАПРЕЩЁННЫЕ для этого устройства (поверх
    // глобальных тумблеров в «Фичи»). Пустой массив снимает ограничение.
    setDeviceLoginMethods: (id: number, disabled: LoginMethod[]) =>
        requests.put<AdminDeviceToken>(`/admin/users/devices/${id}/login-methods`, { disabled }),
    // override — null снимает ограничение (следовать личному выбору юзера /
    // глобальной фиче).
    setDeviceStartScreen: (id: number, override: StartScreenOverride | null) =>
        requests.put<AdminDeviceToken>(`/admin/users/devices/${id}/start-screen`, { override }),
    searchUsers: (q: string, size = 20) =>
        requests.get<Page<any>>(`/admin/users/?q=${encodeURIComponent(q)}&page=1&size=${size}`),
    // cascade — только при разбане: снять и авто-баны, раскрученные от юзера
    // (девайс-honeypot, ввод его номера/почты).
    banUser: (id: number, status: 'active' | 'banned', cascade?: boolean) =>
        requests.put<any>(
            `/admin/users/${id}/ban?status=${status}${cascade ? '&cascade=true' : ''}`,
            {},
        ),
    getBannedIdentifiers: (
        page = 1,
        size = 40,
        filters?: { q?: string; type?: string },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.type) params.set('type', filters.type)
        return requests.get<Page<AdminBannedIdentifierGroup>>(
            `/admin/users/banned-identifiers?${params.toString()}`,
        )
    },
    banIdentifier: (body: { type: string; value: string; reason?: string }) =>
        requests.post<AdminBannedIdentifier>('/admin/users/banned-identifiers', body),
    unbanIdentifier: (id: number) =>
        requests.delete<{ success: boolean }>(`/admin/users/banned-identifiers/${id}`),
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
                // active | banned
                status: string
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
                // active | banned
                user_status: string
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
    adjustUserBalance: (id: number, body: AdminBalanceAdjustBody) =>
        requests.post<AdminBalanceAdjustResult>(`/admin/akcha/users/${id}/balance`, body),
}
