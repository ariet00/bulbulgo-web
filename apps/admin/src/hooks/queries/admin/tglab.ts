import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminTglabUsers = (page = 1, size = 20, q?: string) => {
    return useQuery({
        queryKey: [...adminKeys.tglabUsers(), { page, size, q }],
        queryFn: () => adminApi.getTglabUsers(page, size, q),
        placeholderData: keepPreviousData,
    })
}

export const useAdminTglabRoles = () => {
    return useQuery({
        queryKey: adminKeys.tglabRoles(),
        queryFn: () => adminApi.getTglabRoles(),
        staleTime: 60 * 60 * 1000, // сиды меняются только с деплоем
    })
}
