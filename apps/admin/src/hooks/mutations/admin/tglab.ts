import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    AdminTglabUserCreate,
    AdminTglabUserUpdate,
    adminApi,
} from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'

export const useAdminCreateTglabUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminTglabUserCreate) => adminApi.createTglabUser(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.tglabUsers() })
            toast.success('Оператор создан')
        },
    })
}

export const useAdminUpdateTglabUser = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...body }: AdminTglabUserUpdate & { id: number }) =>
            adminApi.updateTglabUser(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.tglabUsers() })
            toast.success('Оператор обновлён')
        },
    })
}

export const useAdminRevokeTglabAccess = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.revokeTglabAccess(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.tglabUsers() })
            toast.success('Доступ снят')
        },
    })
}
