import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, type IdeaStatus } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminUpdateIdeaStatus = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: IdeaStatus }) =>
            adminApi.updateIdeaStatus(id, status),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.ideas() })
            toast.success('Статус обновлён')
        },
    })
}

export const useAdminDeleteIdea = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteIdea(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.ideas() })
            toast.success('Идея удалена')
        },
    })
}
