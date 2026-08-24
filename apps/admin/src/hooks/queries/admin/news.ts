import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminNewsList = (
    page: number = 1,
    size: number = 40,
    filters?: { q?: string; status?: string },
) => {
    return useQuery({
        queryKey: [...adminKeys.news(), { page, size, ...(filters ?? {}) }],
        queryFn: () => adminApi.getNewsList(page, size, filters),
        placeholderData: keepPreviousData,
    })
}

export const useAdminNews = (id: number) => {
    return useQuery({
        queryKey: adminKeys.newsItem(id),
        queryFn: () => adminApi.getNews(id),
        enabled: !!id,
    })
}
