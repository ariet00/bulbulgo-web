import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminAppFeaturesSettings, AdminAppVersionSettings, AdminMaintenanceSettings, AdminContactLimitsSettings, AdminBumpLimitsSettings, AdminActiveLimitsSettings, AdminServicePrices, AdminParcelTypesSettings, AdminAttractivePricesSettings, AdminSubscriptionSettings, AdminPhoneViewSettings, CeleryPeriodicTaskCreate, CeleryPeriodicTaskUpdate } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

const invalidateCeleryTasks = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: adminKeys.celeryTasks() })
}

export const useAdminCreateCeleryTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: CeleryPeriodicTaskCreate) => adminApi.createCeleryTask(body),
        onSuccess: () => {
            invalidateCeleryTasks(qc)
            toast.success('Periodic task created')
        },
    })
}

export const useAdminUpdateCeleryTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: CeleryPeriodicTaskUpdate }) =>
            adminApi.updateCeleryTask(id, body),
        onSuccess: (_, { id }) => {
            invalidateCeleryTasks(qc)
            qc.invalidateQueries({ queryKey: adminKeys.celeryTask(id) })
        },
    })
}

export const useAdminDeleteCeleryTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteCeleryTask(id),
        onSuccess: () => {
            invalidateCeleryTasks(qc)
            toast.success('Periodic task deleted')
        },
    })
}

// === Notifications ===

export const useAdminRefreshCeleryBeat = () => {
    return useMutation({
        mutationFn: () => adminApi.refreshCeleryBeat(),
        onSuccess: (res) => {
            if (res.ok) toast.success('Beat reload signalled')
            else toast.message(`Beat not reloaded: ${res.reason ?? 'unknown'}`)
        },
    })
}

export const useUpdateAdminAppVersionSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminAppVersionSettings) =>
            adminApi.updateAppVersionSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminMaintenanceSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminMaintenanceSettings) =>
            adminApi.updateMaintenanceSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminAppFeaturesSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminAppFeaturesSettings) =>
            adminApi.updateAppFeaturesSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminContactLimitsSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminContactLimitsSettings) =>
            adminApi.updateContactLimitsSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminBumpLimitsSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminBumpLimitsSettings) =>
            adminApi.updateBumpLimitsSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminActiveLimitsSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminActiveLimitsSettings) =>
            adminApi.updateActiveLimitsSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminSubscriptionSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminSubscriptionSettings) =>
            adminApi.updateSubscriptionSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminPhoneViewSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminPhoneViewSettings) =>
            adminApi.updatePhoneViewSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminServicePricesSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminServicePrices) =>
            adminApi.updateServicePricesSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminParcelTypesSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminParcelTypesSettings) =>
            adminApi.updateParcelTypesSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminAttractivePricesSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminAttractivePricesSettings) =>
            adminApi.updateAttractivePricesSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

// Per-driver limit overrides (from the BulBul Go "limited drivers" card and the
// per-user analytics page). Refresh both the list and the single-user summary.

