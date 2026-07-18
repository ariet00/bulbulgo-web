import type { Page } from '@doska/shared'
import { requests } from './base'

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

export const notificationsAdminApi = {
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
}
