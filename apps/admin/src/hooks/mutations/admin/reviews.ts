import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminReviewStatus } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminSetReviewStatus = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: AdminReviewStatus }) =>
            adminApi.setReviewStatus(id, status),
        onSuccess: (_, { status }) => {
            qc.invalidateQueries({ queryKey: adminKeys.reviews() })
            // Скрытие/возврат меняет рейтинг получателя — карточки пользователей
            // тоже надо перечитать.
            qc.invalidateQueries({ queryKey: adminKeys.users() })
            toast.success(status === 'hidden' ? 'Отзыв скрыт' : 'Отзыв возвращён')
        },
    })
}
