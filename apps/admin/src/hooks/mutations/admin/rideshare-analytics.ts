import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

const invalidateLimitedDrivers = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: [...adminKeys.analytics(), 'rideshare', 'limited-drivers'] })
    qc.invalidateQueries({ queryKey: [...adminKeys.analytics(), 'user-limit'] })
}

export const useSetDriverCredits = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, value }: { userId: number; value: number }) =>
            adminApi.setDriverCredits(userId, { value }),
        onSuccess: () => {
            invalidateLimitedDrivers(qc)
            toast.success('Кредиты обновлены')
        },
    })
}

export const useSetDriverFreeUsed = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, value }: { userId: number; value: number }) =>
            adminApi.setDriverFreeUsed(userId, { value }),
        onSuccess: () => {
            invalidateLimitedDrivers(qc)
            toast.success('Free-лимит обновлён')
        },
    })
}

export const useSetDriverLimited = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, value }: { userId: number; value: number | null }) =>
            adminApi.setDriverLimited(userId, value),
        onSuccess: () => {
            invalidateLimitedDrivers(qc)
            toast.success('Статус лимита обновлён')
        },
    })
}

