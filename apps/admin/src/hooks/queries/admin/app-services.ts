import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminServices = () => {
    return useQuery({
        queryKey: adminKeys.services(),
        queryFn: () => adminApi.getServices(),
    })
}

export const useAdminService = (id: number) => {
    return useQuery({
        queryKey: adminKeys.service(id),
        queryFn: () => adminApi.getService(id),
        enabled: !!id,
    })
}
