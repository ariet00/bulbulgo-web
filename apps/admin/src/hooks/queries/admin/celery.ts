import { useQuery } from '@tanstack/react-query'

import { adminApi, CeleryRunsFilters } from '@/apis/admin'
import { adminKeys } from './keys'

// Live views poll — workers/active reflect "right now" and only show
// currently-connected workers.
export const useAdminCeleryWorkers = () => {
    return useQuery({
        queryKey: adminKeys.celeryWorkers(),
        queryFn: () => adminApi.getCeleryWorkers(),
        refetchInterval: 10_000,
    })
}

export const useAdminCeleryActive = (enabled = true) => {
    return useQuery({
        queryKey: adminKeys.celeryActive(),
        queryFn: () => adminApi.getCeleryActive(),
        refetchInterval: 5_000,
        enabled,
    })
}

export const useAdminCeleryRuns = (filters: CeleryRunsFilters) => {
    return useQuery({
        queryKey: adminKeys.celeryRuns(filters),
        queryFn: () => adminApi.listCeleryRuns(filters),
        placeholderData: (prev) => prev,
    })
}

export const useAdminCeleryRun = (id: number | null) => {
    return useQuery({
        queryKey: adminKeys.celeryRun(id ?? 0),
        queryFn: () => adminApi.getCeleryRun(id as number),
        enabled: id != null,
    })
}

export const useAdminCeleryRunsSummary = (windowHours = 24) => {
    return useQuery({
        queryKey: adminKeys.celeryRunsSummary(windowHours),
        queryFn: () => adminApi.getCeleryRunsSummary(windowHours),
        refetchInterval: 30_000,
    })
}
