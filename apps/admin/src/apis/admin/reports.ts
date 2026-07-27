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

export interface AdminReportParams {
    period?: string
    purpose?: string
    platform?: string
    granularity?: string
    limit?: number
}

const qs = (params: AdminReportParams) => {
    const q = new URLSearchParams()
    if (params.period) q.set('period', params.period)
    if (params.purpose) q.set('purpose', params.purpose)
    if (params.platform) q.set('platform', params.platform)
    if (params.granularity) q.set('granularity', params.granularity)
    if (params.limit) q.set('limit', String(params.limit))
    return q.toString()
}

const OTP_BASE = '/admin/analytics/reports/otp'

// ── Referral report (/admin/analytics/reports/referral) ─────────────────────

export interface AdminReferralReportSummary {
    shared: number
    code_checked: number
    code_valid: number
    captured: number
    rewarded: number
    rejected: number
    signed_up: number
    paid_total: number
    paid_referrers: number
    paid_referees: number
    pipeline_pending: number
    pipeline_rewarded: number
    pipeline_capped: number
    pipeline_void: number
    prev_captured: number
    prev_rewarded: number
    prev_rejected: number
    prev_paid_total: number
}

export interface AdminReferralTimeseriesRow {
    bucket: string
    captured: number
    rewarded: number
    rejected: number
}

export interface AdminReferralRejectionRow {
    reason: string | null
    count: number
    last_seen: string
}

export interface AdminReferralTopRow {
    user_id: number
    name: string | null
    username: string | null
    phone: string | null
    captured: number
    payouts: number
    earned: number
    last_payout: string | null
}

const REFERRAL_BASE = '/admin/analytics/reports/referral'

export const reportsAdminApi = {
    getOtpReportSummary: (params: AdminReportParams) =>
        requests.get<AdminOtpReportSummary>(`${OTP_BASE}/summary?${qs(params)}`),
    getOtpReportTimeseries: (params: AdminReportParams) =>
        requests.get<AdminOtpTimeseriesRow[]>(`${OTP_BASE}/timeseries?${qs(params)}`),
    getOtpReportFailures: (params: AdminReportParams) =>
        requests.get<AdminOtpFailureRow[]>(`${OTP_BASE}/failures?${qs(params)}`),
    getOtpReportPlatforms: (params: AdminReportParams) =>
        requests.get<AdminOtpPlatformRow[]>(`${OTP_BASE}/platforms?${qs(params)}`),
    getOtpReportTopPhones: (params: AdminReportParams) =>
        requests.get<AdminOtpPhoneRow[]>(`${OTP_BASE}/top-phones?${qs(params)}`),
    getReferralReportSummary: (params: AdminReportParams) =>
        requests.get<AdminReferralReportSummary>(`${REFERRAL_BASE}/summary?${qs(params)}`),
    getReferralReportTimeseries: (params: AdminReportParams) =>
        requests.get<AdminReferralTimeseriesRow[]>(`${REFERRAL_BASE}/timeseries?${qs(params)}`),
    getReferralReportRejections: (params: AdminReportParams) =>
        requests.get<AdminReferralRejectionRow[]>(`${REFERRAL_BASE}/rejections?${qs(params)}`),
    getReferralReportTopReferrers: (params: AdminReportParams) =>
        requests.get<AdminReferralTopRow[]>(`${REFERRAL_BASE}/top-referrers?${qs(params)}`),
}
