import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AdminReviewListParams, adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminReviews = (
    page: number = 1,
    size: number = 40,
    filters?: AdminReviewListParams,
) => {
    return useQuery({
        queryKey: [...adminKeys.reviews(), { page, size, ...(filters ?? {}) }],
        queryFn: () => adminApi.getReviews(page, size, filters),
        placeholderData: keepPreviousData,
    })
}
