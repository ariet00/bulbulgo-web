import { useQuery } from '@tanstack/react-query'
import {
    AdminBroadcastFilters,
    AdminNotificationListParams,
    adminApi,
} from '../../apis/admin'

export const adminKeys = {
    all: ['admin'] as const,
    users: () => [...adminKeys.all, 'users'] as const,
    user: (id: number) => [...adminKeys.users(), id] as const,
    companies: () => [...adminKeys.all, 'companies'] as const,
    company: (id: number) => [...adminKeys.companies(), id] as const,
    trips: () => [...adminKeys.all, 'trips'] as const,
    trip: (id: number) => [...adminKeys.trips(), id] as const,
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
}

export const useAdminUsers = (page: number = 1, size: number = 40, q?: string) => {
    return useQuery({
        queryKey: [...adminKeys.users(), { page, size, q: q ?? null }],
        queryFn: () => adminApi.getUsers(page, size, q),
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
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.trips(),
            { page, size, q: q ?? null, status: status ?? null },
        ],
        queryFn: () => adminApi.getTrips(page, size, q, status),
    })
}

export const useAdminTrip = (id: number) => {
    return useQuery({
        queryKey: adminKeys.trip(id),
        queryFn: () => adminApi.getTrip(id),
        enabled: !!id,
    })
}

export const useAdminVehicles = (
    page: number = 1,
    size: number = 40,
    q?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.vehicles(), { page, size, q: q ?? null }],
        queryFn: () => adminApi.getVehicles(page, size, q),
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
