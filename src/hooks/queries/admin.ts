import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'

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
}

export const useAdminUsers = (page: number = 1, size: number = 40) => {
    return useQuery({
        queryKey: [...adminKeys.users(), { page, size }],
        queryFn: () => adminApi.getUsers(page, size),
    })
}

export const useAdminUser = (id: number) => {
    return useQuery({
        queryKey: adminKeys.user(id),
        queryFn: () => adminApi.getUser(id),
        enabled: !!id,
    })
}

export const useAdminCompanies = (page: number = 1, size: number = 40) => {
    return useQuery({
        queryKey: [...adminKeys.companies(), { page, size }],
        queryFn: () => adminApi.getCompanies(page, size),
    })
}

export const useAdminCompany = (id: number) => {
    return useQuery({
        queryKey: adminKeys.company(id),
        queryFn: () => adminApi.getCompany(id),
        enabled: !!id,
    })
}

export const useAdminTrips = (page: number = 1, size: number = 40) => {
    return useQuery({
        queryKey: [...adminKeys.trips(), { page, size }],
        queryFn: () => adminApi.getTrips(page, size),
    })
}

export const useAdminTrip = (id: number) => {
    return useQuery({
        queryKey: adminKeys.trip(id),
        queryFn: () => adminApi.getTrip(id),
        enabled: !!id,
    })
}

export const useAdminVehicles = (page: number = 1, size: number = 40) => {
    return useQuery({
        queryKey: [...adminKeys.vehicles(), { page, size }],
        queryFn: () => adminApi.getVehicles(page, size),
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

export const useAdminChats = (page: number = 1, size: number = 40) => {
    return useQuery({
        queryKey: [...adminKeys.chats(), { page, size }],
        queryFn: () => adminApi.getChats(page, size),
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
