import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminTrips = (
    page: number = 1,
    size: number = 40,
    q?: string,
    status?: string,
    filters?: {
        trip_type?: string
        role?: string
        user_id?: number
        from_location_id?: number
        to_location_id?: number
        price_min?: number
        price_max?: number
        seats_min?: number
        seats_max?: number
        date_from?: string
        date_to?: string
        service?: string
        only_real?: boolean
        include_deleted?: boolean
    },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.trips(),
            {
                page,
                size,
                q: q ?? null,
                status: status ?? null,
                trip_type: filters?.trip_type ?? null,
                role: filters?.role ?? null,
                user_id: filters?.user_id ?? null,
                from_location_id: filters?.from_location_id ?? null,
                to_location_id: filters?.to_location_id ?? null,
                price_min: filters?.price_min ?? null,
                price_max: filters?.price_max ?? null,
                seats_min: filters?.seats_min ?? null,
                seats_max: filters?.seats_max ?? null,
                date_from: filters?.date_from ?? null,
                date_to: filters?.date_to ?? null,
                service: filters?.service ?? null,
                only_real: filters?.only_real ?? null,
                include_deleted: filters?.include_deleted ?? null,
            },
        ],
        queryFn: () => adminApi.getTrips(page, size, q, status, filters),
    })
}

export const useAdminTrip = (id: number) => {
    return useQuery({
        queryKey: adminKeys.trip(id),
        queryFn: () => adminApi.getTrip(id),
        enabled: !!id,
    })
}

export const useAdminTripSubscriptions = (
    page: number = 1,
    size: number = 40,
    filters?: {
        q?: string
        trip_type?: string
        search_role?: string
        user_id?: number
        is_active?: boolean
        include_deleted?: boolean
    },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.subscriptions(),
            {
                page,
                size,
                q: filters?.q ?? null,
                trip_type: filters?.trip_type ?? null,
                search_role: filters?.search_role ?? null,
                user_id: filters?.user_id ?? null,
                is_active: filters?.is_active ?? null,
                include_deleted: filters?.include_deleted ?? null,
            },
        ],
        queryFn: () => adminApi.getTripSubscriptions(page, size, filters),
        placeholderData: keepPreviousData,
    })
}

export const useAdminTripServicePayments = (id: number) => {
    return useQuery({
        queryKey: [...adminKeys.trip(id), 'service-payments'] as const,
        queryFn: () => adminApi.getTripServicePayments(id),
        enabled: !!id,
    })
}

export const useAdminTripPhoneViewers = (id: number, page = 1, size = 10) => {
    return useQuery({
        queryKey: adminKeys.tripPhoneViewers(id, page, size),
        queryFn: () => adminApi.getTripPhoneViewers(id, page, size),
        enabled: !!id,
        placeholderData: keepPreviousData,
    })
}

export const useAdminTripViewers = (id: number, page = 1, size = 10) => {
    return useQuery({
        queryKey: adminKeys.tripViewers(id, page, size),
        queryFn: () => adminApi.getTripViewers(id, page, size),
        enabled: !!id,
        placeholderData: keepPreviousData,
    })
}

export const useAdminTripBumps = (id: number, page = 1, size = 10) => {
    return useQuery({
        queryKey: adminKeys.tripBumps(id, page, size),
        queryFn: () => adminApi.getTripBumps(id, page, size),
        enabled: !!id,
        placeholderData: keepPreviousData,
    })
}

export const useAdminBlockedAuthors = () => {
    return useQuery({
        queryKey: adminKeys.blockedAuthors(),
        queryFn: () => adminApi.getBlockedAuthors(),
    })
}
