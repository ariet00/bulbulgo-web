import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminRegionInput } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

const invalidateRegions = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: [...adminKeys.all, 'regions'] })
    qc.invalidateQueries({ queryKey: [...adminKeys.all, 'region'] })
}

export const useCreateAdminRegion = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminRegionInput) => adminApi.createRegion(body),
        onSuccess: () => {
            invalidateRegions(qc)
            toast.success('Регион создан')
        },
    })
}

export const useUpdateAdminRegion = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: Partial<AdminRegionInput> }) =>
            adminApi.updateRegion(id, body),
        onSuccess: () => {
            invalidateRegions(qc)
            toast.success('Регион обновлён')
        },
    })
}
