import { useQuery } from '@tanstack/react-query'
import { AdminBroadcastFilters, AdminNotificationListParams, adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

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
