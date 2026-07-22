import { requests } from './base'

/** Роли объявлений на бэке: driver | passenger | parcel — тут не нужны. */

export interface AdminReferralSettings {
    /** Приём новых приглашений (выдача кодов + привязка нового юзера). */
    capture_enabled: boolean
    /** Начисление наград по уже привязанным (pending) рефералам. */
    rewards_enabled: boolean
    /** Бонус пригласившему, в валюте currency. */
    referrer_reward: number
    /** Бонус приглашённому (зарегистрировался по коду), в валюте currency. */
    referee_reward: number
    /** Лимит оплаченных рефералов на одного пригласившего (0 = без лимита). */
    per_referrer_cap: number
    currency: string
}

export interface AdminReferrerRow {
    referrer_id: number
    name: string | null
    username: string | null
    phone: string | null
    invited_count: number
    rewarded_count: number
    earned: number
}

export interface AdminReferralReport {
    rows: AdminReferrerRow[]
    total_referrers: number
    total_invited: number
    total_rewarded: number
}

export const referralAdminApi = {
    getReferralSettings: () =>
        requests.get<AdminReferralSettings>('/admin/referral/settings'),
    updateReferralSettings: (body: AdminReferralSettings) =>
        requests.put<AdminReferralSettings>('/admin/referral/settings', body),
    getReferralReport: (limit = 50) =>
        requests.get<AdminReferralReport>(
            `/admin/referral/report?limit=${limit}`,
        ),
}
