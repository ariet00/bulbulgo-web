import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FuelPointsSettings, adminApi } from '@/apis/admin'
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

export const useAdminUpdateFuelPointsSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: FuelPointsSettings) =>
            adminApi.updateFuelPointsSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({
                queryKey: [...adminKeys.all, 'fuel', 'points-settings'],
            })
            toast.success('Настройки баллов сохранены')
        },
    })
}
