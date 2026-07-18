import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminRegions = (q?: string, limit?: number) => {
    return useQuery({
        queryKey: adminKeys.regions(q, limit),
        queryFn: () => adminApi.getRegions(q, limit),
        placeholderData: keepPreviousData,
    })
}

export const useAdminRegion = (id: number | null) => {
    return useQuery({
        queryKey: adminKeys.region(id as number),
        queryFn: () => adminApi.getRegion(id as number),
        enabled: id != null,
        staleTime: 1000 * 60 * 60,
    })
}
