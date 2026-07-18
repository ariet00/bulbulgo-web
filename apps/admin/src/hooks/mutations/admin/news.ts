import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminNewsInput } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminCreateNews = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminNewsInput) => adminApi.createNews(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.news() })
            toast.success('Новость создана')
        },
    })
}

export const useAdminUpdateNews = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...body }: { id: number } & Partial<AdminNewsInput>) =>
            adminApi.updateNews(id, body),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: adminKeys.news() })
            qc.invalidateQueries({ queryKey: adminKeys.newsItem(id) })
            toast.success('Новость сохранена')
        },
    })
}

export const useAdminDeleteNews = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteNews(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.news() })
            toast.success('Новость удалена')
        },
    })
}
