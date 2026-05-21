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
    deleteNotification: (id: number) =>
        requests.delete<any>(`/admin/notifications/${id}`),

    // Analytics
    getAnalytics: () => requests.get<any>('/admin/analytics/'),

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
    data?: Record<string, any>
}

export interface AdminBroadcastNotification {
    title: string
    body: string
    type?: string
    data?: Record<string, any>
    click_action?: string
    filters?: {
        role_id?: number | null
        is_active?: boolean | null
        device_type?: string | null
    }
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
