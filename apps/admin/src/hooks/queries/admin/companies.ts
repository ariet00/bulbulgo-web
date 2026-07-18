import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminCompanies = (
    page: number = 1,
    size: number = 40,
    q?: string,
    type?: string,
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.companies(),
            { page, size, q: q ?? null, type: type ?? null },
        ],
        queryFn: () => adminApi.getCompanies(page, size, q, type),
    })
}

export const useAdminCompany = (id: number) => {
    return useQuery({
        queryKey: adminKeys.company(id),
        queryFn: () => adminApi.getCompany(id),
        enabled: !!id,
    })
}
