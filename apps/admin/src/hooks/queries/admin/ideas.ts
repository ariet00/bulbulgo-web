import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminIdeasList = (
    page: number = 1,
    size: number = 40,
    filters?: { q?: string; status?: string },
) => {
    return useQuery({
        queryKey: [...adminKeys.ideas(), { page, size, ...(filters ?? {}) }],
        queryFn: () => adminApi.getIdeasList(page, size, filters),
        placeholderData: keepPreviousData,
    })
}
