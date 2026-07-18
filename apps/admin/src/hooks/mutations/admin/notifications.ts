import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminBroadcastNotification, AdminScheduleNotification, AdminSendNotification } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminSendNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminSendNotification) => adminApi.sendNotification(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Уведомление поставлено в очередь')
        },
    })
}

export const useAdminBroadcastNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminBroadcastNotification) => adminApi.broadcastNotification(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Рассылка поставлена в очередь')
        },
    })
}

export const useAdminDeleteNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteNotification(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Уведомление удалено')
        },
    })
}

// === Promotions (in-app custom ads) ===

export const useAdminScheduleNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminScheduleNotification) => adminApi.scheduleNotification(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Уведомление запланировано')
        },
    })
}

export const useAdminCancelScheduledNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.cancelScheduledNotification(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Отменено')
        },
    })
}
