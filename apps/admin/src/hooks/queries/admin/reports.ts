import { useQuery } from '@tanstack/react-query'
import { adminApi, type AdminReportParams } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminOtpReportSummary = (params: AdminReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'summary', params],
        queryFn: () => adminApi.getOtpReportSummary(params),
    })
}

export const useAdminOtpReportTimeseries = (params: AdminReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'timeseries', params],
        queryFn: () => adminApi.getOtpReportTimeseries(params),
    })
}

export const useAdminOtpReportFailures = (params: AdminReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'failures', params],
        queryFn: () => adminApi.getOtpReportFailures(params),
    })
}

export const useAdminOtpReportPlatforms = (params: AdminReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'platforms', params],
        queryFn: () => adminApi.getOtpReportPlatforms(params),
    })
}

export const useAdminOtpReportTopPhones = (params: AdminReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'otp', 'top-phones', params],
        queryFn: () => adminApi.getOtpReportTopPhones(params),
    })
}

export const useAdminReferralReportSummary = (params: AdminReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'referral', 'summary', params],
        queryFn: () => adminApi.getReferralReportSummary(params),
    })
}

export const useAdminReferralReportTimeseries = (params: AdminReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'referral', 'timeseries', params],
        queryFn: () => adminApi.getReferralReportTimeseries(params),
    })
}

export const useAdminReferralReportRejections = (params: AdminReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'referral', 'rejections', params],
        queryFn: () => adminApi.getReferralReportRejections(params),
    })
}

export const useAdminReferralReportTopReferrers = (params: AdminReportParams) => {
    return useQuery({
        queryKey: [...adminKeys.reports(), 'referral', 'top-referrers', params],
        queryFn: () => adminApi.getReferralReportTopReferrers(params),
    })
}
