import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminDeleteFuelReport = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteFuelReport(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.fuelReports() })
            toast.success('Метка удалена')
        },
    })
}
