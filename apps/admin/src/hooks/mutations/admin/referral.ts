import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminReferralSettings } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin/keys'

export const useUpdateAdminReferralSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminReferralSettings) =>
            adminApi.updateReferralSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.referralSettings() })
        },
    })
}
