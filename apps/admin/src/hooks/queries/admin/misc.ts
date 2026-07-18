import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminVehicles = (
    page: number = 1,
    size: number = 40,
    q?: string,
    filters?: {
        vehicle_type?: string
        year?: number
        user_id?: number
    },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.vehicles(),
            {
                page,
                size,
                q: q ?? null,
                vehicle_type: filters?.vehicle_type ?? null,
                year: filters?.year ?? null,
                user_id: filters?.user_id ?? null,
            },
        ],
        queryFn: () => adminApi.getVehicles(page, size, q, filters),
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
