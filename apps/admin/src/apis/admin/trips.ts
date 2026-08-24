import type { Page } from '@doska/shared'
import { requests } from './base'

export interface TripViewersResponse {
    trip_id: number
    total_viewers: number
    total_views: number
    page: number
    size: number
    viewers: Array<{
        user_id: number | null
        name: string | null
        phone: string | null
        avatar_url: string | null
        views_count: number
        first_viewed_at: string
        last_viewed_at: string
    }>
}

export interface TripBumpsResponse {
    trip_id: number
    total: number
    page: number
    size: number
    bumps: Array<{
        user_id: number | null
        name: string | null
        avatar_url: string | null
        platform: string | null
        bumped_at: string
    }>
}

export interface BlockedAuthor {
    author_id: number
    username: string | null
    name: string | null
    trip_id: number | null
    blocked_by: string | null
    blocked_at: string | null
}

export interface AdminTripSubscription {
    id: number
    user_id: number
    user_name: string | null
    user_phone: string | null
    user_avatar_url: string | null
    from_location_id: number
    from_name: string | null
    to_location_id: number
    to_name: string | null
    trip_type: string | null
    search_role: string
    max_price: number | null
    is_active: boolean
    is_deleted: boolean
    expire_at: string | null
    created_at: string
}

export const tripsAdminApi = {
    // Trips
    getTrips: (
        page = 1,
        size = 40,
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
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (status) params.set('status', status)
        if (filters?.service) params.set('service', filters.service)
        if (filters?.include_deleted) params.set('include_deleted', 'true')
        if (filters?.trip_type) params.set('trip_type', filters.trip_type)
        if (filters?.role) params.set('role', filters.role)
        if (filters?.user_id) params.set('user_id', String(filters.user_id))
        if (filters?.from_location_id) params.set('from_location_id', String(filters.from_location_id))
        if (filters?.to_location_id) params.set('to_location_id', String(filters.to_location_id))
        if (filters?.price_min != null) params.set('price_min', String(filters.price_min))
        if (filters?.price_max != null) params.set('price_max', String(filters.price_max))
        if (filters?.seats_min != null) params.set('seats_min', String(filters.seats_min))
        if (filters?.seats_max != null) params.set('seats_max', String(filters.seats_max))
        if (filters?.date_from) params.set('date_from', filters.date_from)
        if (filters?.date_to) params.set('date_to', filters.date_to)
        if (filters?.only_real !== undefined)
            params.set('only_real', String(filters.only_real))
        return requests.get<Page<any>>(`/admin/trips/?${params.toString()}`)
    },
    getTrip: (id: number) => requests.get<any>(`/admin/trips/${id}`),
    setTripServiceUntil: (id: number, body: { service_type: string; until: string }) =>
        requests.post<{
            service_type: string
            until: string
            active: boolean
            admin_edited: boolean
        }>(`/admin/trips/${id}/service-until`, body),
    getTripServicePayments: (id: number) =>
        requests.get<
            Array<{
                id: number
                service_type: string | null
                tariff_id: string | null
                amount: number
                currency: string | null
                description: string | null
                user_id: number
                user_name: string | null
                created_at: string
            }>
        >(`/admin/trips/${id}/service-payments`),
    getTripPhoneViewers: (id: number, page = 1, size = 10) =>
        requests.get<TripViewersResponse>(
            `/admin/rideshare/analytics/trips/${id}/phone-viewers?page=${page}&size=${size}`,
        ),
    getTripViewers: (id: number, page = 1, size = 10) =>
        requests.get<TripViewersResponse>(
            `/admin/rideshare/analytics/trips/${id}/viewers?page=${page}&size=${size}`,
        ),
    getTripBumps: (id: number, page = 1, size = 10) =>
        requests.get<TripBumpsResponse>(
            `/admin/rideshare/analytics/trips/${id}/bumps?page=${page}&size=${size}`,
        ),
    updateTripStatus: (id: number, status: string) =>
        requests.patch<any>(`/admin/trips/${id}/status`, { status }),
    bumpTrip: (id: number) =>
        requests.post<{ message: string; id: number }>(`/admin/trips/${id}/bump`, {}),
    deleteTrip: (id: number) => requests.delete<any>(`/admin/trips/${id}`),

    // Parser author blocklist (Telegram accounts the chat parser skips)
    getBlockedAuthors: () =>
        requests.get<BlockedAuthor[]>(`/admin/trips/blocked-authors`),
    blockAuthor: (payload: {
        author_id: number
        username?: string | null
        name?: string | null
        trip_id?: number | null
    }) => requests.post<BlockedAuthor>(`/admin/trips/blocked-authors`, payload),
    unblockAuthor: (authorId: number) =>
        requests.delete<{ message: string; removed: boolean }>(
            `/admin/trips/blocked-authors/${authorId}`,
        ),

    // Trip subscriptions (saved searches)
    getTripSubscriptions: (
        page = 1,
        size = 40,
        filters?: {
            q?: string
            trip_type?: string
            search_role?: string
            user_id?: number
            is_active?: boolean
            include_deleted?: boolean
        },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.trip_type) params.set('trip_type', filters.trip_type)
        if (filters?.search_role) params.set('search_role', filters.search_role)
        if (filters?.user_id) params.set('user_id', String(filters.user_id))
        if (filters?.is_active !== undefined) params.set('is_active', String(filters.is_active))
        if (filters?.include_deleted) params.set('include_deleted', 'true')
        return requests.get<Page<AdminTripSubscription>>(
            `/admin/rideshare/subscriptions/?${params.toString()}`,
        )
    },
    setTripSubscriptionActive: (id: number, isActive: boolean) =>
        requests.patch<AdminTripSubscription>(`/admin/rideshare/subscriptions/${id}`, {
            is_active: isActive,
        }),
    deleteTripSubscription: (id: number) =>
        requests.delete<any>(`/admin/rideshare/subscriptions/${id}`),
}
