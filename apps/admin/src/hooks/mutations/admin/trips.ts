import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminDeleteTrip = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteTrip(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.trips() })
            queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Trip deleted')
        },
    })
}

export const useAdminSetTripServiceUntil = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            service_type,
            until,
        }: {
            id: number
            service_type: string
            until: string
        }) => adminApi.setTripServiceUntil(id, { service_type, until }),
        onSuccess: (data, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.trip(id) })
            queryClient.invalidateQueries({ queryKey: adminKeys.trips() })
            toast.success(data.active ? 'Срок услуги обновлён' : 'Услуга деактивирована')
        },
    })
}

export const useAdminBumpTrip = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.bumpTrip(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.trips() })
            queryClient.invalidateQueries({ queryKey: adminKeys.trip(id) })
            toast.success('Объявление поднято')
        },
    })
}

export const useAdminUpdateTripStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            adminApi.updateTripStatus(id, status),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.trips() })
            queryClient.invalidateQueries({ queryKey: adminKeys.trip(id) })
            queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Статус поездки обновлён')
        },
    })
}

export const useAdminBlockAuthor = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: {
            author_id: number
            username?: string | null
            name?: string | null
            trip_id?: number | null
        }) => adminApi.blockAuthor(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.blockedAuthors() })
            toast.success('Автор заблокирован — его посты парсер пропускает')
        },
    })
}

export const useAdminUnblockAuthor = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (authorId: number) => adminApi.unblockAuthor(authorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.blockedAuthors() })
            toast.success('Автор разблокирован')
        },
    })
}

export const useAdminSetTripSubscriptionActive = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            adminApi.setTripSubscriptionActive(id, isActive),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.subscriptions() })
            toast.success('Подписка обновлена')
        },
    })
}

export const useAdminDeleteTripSubscription = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteTripSubscription(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.subscriptions() })
            toast.success('Подписка удалена')
        },
    })
}
