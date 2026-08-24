import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminServiceGroups = () => {
    return useQuery({
        queryKey: adminKeys.serviceGroups(),
        queryFn: () => adminApi.getServiceGroups(),
    })
}
