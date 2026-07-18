import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminServiceCreate, AdminServiceUpdate } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminCreateService = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminServiceCreate) => adminApi.createService(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.services() })
            toast.success('Сервис создан')
        },
    })
}

export const useAdminUpdateService = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminServiceUpdate }) =>
            adminApi.updateService(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.services() })
            toast.success('Сервис обновлён')
        },
    })
}

export const useAdminDeleteService = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteService(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.services() })
            toast.success('Сервис удалён')
        },
    })
}
