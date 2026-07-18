import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AnalyticsCleanupConfigInput, AnalyticsPurgeInput } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useSetAnalyticsMiddlewareToggle = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (enabled: boolean) => adminApi.setAnalyticsMiddlewareToggle(enabled),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.analytics() })
        },
    })
}

export const useSetAnalyticsCleanupConfig = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AnalyticsCleanupConfigInput) =>
            adminApi.setAnalyticsCleanupConfig(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Настройки очистки сохранены')
        },
    })
}

export const useRunAnalyticsCleanup = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: () => adminApi.runAnalyticsCleanup(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Очистка запущена')
        },
    })
}

export const useAnalyticsPurgePreview = () => {
    return useMutation({
        mutationFn: (body: AnalyticsPurgeInput) => adminApi.previewAnalyticsPurge(body),
    })
}

export const useRunAnalyticsPurge = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AnalyticsPurgeInput) => adminApi.runAnalyticsPurge(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Удаление запущено')
        },
    })
}
