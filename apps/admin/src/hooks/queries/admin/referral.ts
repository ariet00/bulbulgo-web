import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminReferralSettings = () => {
    return useQuery({
        queryKey: adminKeys.referralSettings(),
        queryFn: () => adminApi.getReferralSettings(),
    })
}

export const useAdminReferralReport = (limit = 50) => {
    return useQuery({
        queryKey: adminKeys.referralReport(limit),
        queryFn: () => adminApi.getReferralReport(limit),
    })
}
