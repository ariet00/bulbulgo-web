import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    adminApi,
    AdminServiceGroupCreate,
    AdminServiceGroupUpdate,
} from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

/** Состав группы зависит от сервисов — инвалидируем оба списка разом. */
const useGroupsInvalidator = () => {
    const qc = useQueryClient()
    return () => {
        qc.invalidateQueries({ queryKey: adminKeys.serviceGroups() })
        qc.invalidateQueries({ queryKey: adminKeys.services() })
    }
}

export const useAdminCreateServiceGroup = () => {
    const invalidate = useGroupsInvalidator()
    return useMutation({
        mutationFn: (body: AdminServiceGroupCreate) =>
            adminApi.createServiceGroup(body),
        onSuccess: () => {
            invalidate()
            toast.success('Группа создана')
        },
    })
}

export const useAdminUpdateServiceGroup = () => {
    const invalidate = useGroupsInvalidator()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminServiceGroupUpdate }) =>
            adminApi.updateServiceGroup(id, body),
        onSuccess: () => {
            invalidate()
            toast.success('Группа обновлена')
        },
    })
}

export const useAdminDeleteServiceGroup = () => {
    const invalidate = useGroupsInvalidator()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteServiceGroup(id),
        onSuccess: () => {
            invalidate()
            toast.success('Группа удалена')
        },
    })
}

export const useAdminSetServiceGroupItems = () => {
    const invalidate = useGroupsInvalidator()
    return useMutation({
        mutationFn: ({ id, services }: { id: number; services: string[] }) =>
            adminApi.setServiceGroupItems(id, services),
        onSuccess: () => invalidate(),
    })
}
