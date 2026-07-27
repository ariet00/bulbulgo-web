import { useQuery } from '@tanstack/react-query'
import { adminApi, type AdminOtpReportParams } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminOtpReportSummary = (params: AdminOtpReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'summary', params],
        queryFn: () => adminApi.getOtpReportSummary(params),
    })
}

export const useAdminOtpReportTimeseries = (params: AdminOtpReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'timeseries', params],
        queryFn: () => adminApi.getOtpReportTimeseries(params),
    })
}

export const useAdminOtpReportFailures = (params: AdminOtpReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'failures', params],
        queryFn: () => adminApi.getOtpReportFailures(params),
    })
}

export const useAdminOtpReportPlatforms = (params: AdminOtpReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'platforms', params],
        queryFn: () => adminApi.getOtpReportPlatforms(params),
    })
}

export const useAdminOtpReportTopPhones = (params: AdminOtpReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'top-phones', params],
        queryFn: () => adminApi.getOtpReportTopPhones(params),
    })
}
