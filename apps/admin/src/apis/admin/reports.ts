import { requests } from './base'

// ── OTP report (/admin/analytics/reports/otp) ───────────────────────────────

export interface AdminOtpReportSummary {
    requested: number
    verified: number
    failed: number
    users: number
    devices: number
    avg_requests_per_success: number | null
    prev_requested: number
    prev_verified: number
    prev_failed: number
}

export interface AdminOtpTimeseriesRow {
    bucket: string
    requested: number
    verified: number
    failed: number
}

export interface AdminOtpFailureRow {
    reason: string | null
    stage: string | null
    count: number
    users: number
    last_seen: string
}

export interface AdminOtpPlatformRow {
    platform: string | null
    requested: number
    verified: number
    failed: number
}

export interface AdminOtpPhoneRow {
    phone: string
    requested: number
    verified: number
    failed: number
    users: number
    last_seen: string
}

export interface AdminOtpReportParams {
    period?: string
    purpose?: string
    platform?: string
    granularity?: string
    limit?: number
}

const qs = (params: AdminOtpReportParams) => {
    const q = new URLSearchParams()
    if (params.period) q.set('period', params.period)
    if (params.purpose) q.set('purpose', params.purpose)
    if (params.platform) q.set('platform', params.platform)
    if (params.granularity) q.set('granularity', params.granularity)
    if (params.limit) q.set('limit', String(params.limit))
    return q.toString()
}

const BASE = '/admin/analytics/reports/otp'

export const reportsAdminApi = {
    getOtpReportSummary: (params: AdminOtpReportParams) =>
        requests.get<AdminOtpReportSummary>(`${BASE}/summary?${qs(params)}`),
    getOtpReportTimeseries: (params: AdminOtpReportParams) =>
        requests.get<AdminOtpTimeseriesRow[]>(`${BASE}/timeseries?${qs(params)}`),
    getOtpReportFailures: (params: AdminOtpReportParams) =>
        requests.get<AdminOtpFailureRow[]>(`${BASE}/failures?${qs(params)}`),
    getOtpReportPlatforms: (params: AdminOtpReportParams) =>
        requests.get<AdminOtpPlatformRow[]>(`${BASE}/platforms?${qs(params)}`),
    getOtpReportTopPhones: (params: AdminOtpReportParams) =>
        requests.get<AdminOtpPhoneRow[]>(`${BASE}/top-phones?${qs(params)}`),
}
