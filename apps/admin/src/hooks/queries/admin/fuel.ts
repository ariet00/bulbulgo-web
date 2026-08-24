import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AdminFuelReportFilters, adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminFuelStations = (
    page = 1,
    size = 50,
    filters?: { q?: string; enabled?: boolean },
) => {
    return useQuery({
        queryKey: [...adminKeys.fuelStations(), { page, size, ...(filters ?? {}) }],
        queryFn: () => adminApi.getFuelStations(page, size, filters),
        placeholderData: keepPreviousData,
    })
}

export const useAdminFuelReports = (
    page = 1,
    size = 50,
    filters?: AdminFuelReportFilters,
) => {
    return useQuery({
        queryKey: [...adminKeys.fuelReports(), { page, size, ...(filters ?? {}) }],
        queryFn: () => adminApi.getFuelReports(page, size, filters),
        placeholderData: keepPreviousData,
    })
}

export const useAdminFuelPointsSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.all, 'fuel', 'points-settings'],
        queryFn: () => adminApi.getFuelPointsSettings(),
    })
}
