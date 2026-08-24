import { useQuery } from '@tanstack/react-query'

import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminSeeders = () => {
    return useQuery({
        queryKey: adminKeys.seeders(),
        queryFn: () => adminApi.listSeeders(),
    })
}
