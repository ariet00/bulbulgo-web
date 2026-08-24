import { requests } from './base'

export interface BookingBotItem {
    bot_id: number
    bot_slug: string
    bot_name: string | null
    bot_username: string | null
    bot_type: string | null
    mini_app_url: string | null
    is_active: boolean
    company_id: number | null
    company_slug: string | null
    company_name: string | null
    company_type: string | null
    company_status: string | null
    owner_id: number | null
    owner_username: string | null
    owner_name: string | null
    owner_phone: string | null
}

export interface BookingOnboardRequest {
    owner_user_id: number
    name: string
    slug: string
    description?: string
    bot_token: string
    bot_name?: string
    timezone?: string
    currency?: string
}

export interface BookingOnboardResponse {
    company_id: number
    bot_id: number
    bot_slug: string
    webhook_set: boolean
}

export interface BookingLinkRequest {
    bot_slug: string
    owner_user_id: number
    company_name: string
    company_slug?: string
    description?: string
    timezone?: string
    currency?: string
}

export interface BookingLinkResponse {
    company_id: number
    bot_id: number
    bot_slug: string
    created_company: boolean
    settings_created: boolean
    schedule_created: boolean
}

export interface BookingBotUpdate {
    name?: string
    username?: string
    is_active?: boolean
    /** 0 → unlink, >0 → link/move, omit → no change */
    company_id?: number | null
    bot_type?: string
    /** Empty string clears it. */
    mini_app_url?: string
    /** Write-only: set a new bot token. Omit/empty → no change. Never returned. */
    token?: string
}

export interface BookingBotUpdateResponse {
    bot: BookingBotItem
    needs_booking_settings: boolean
}

export const bookingAdminApi = {
    // Booking — bots & onboarding
    getBookingBots: (onlyUnlinked = false) =>
        requests.get<BookingBotItem[]>(`/admin/booking/bots?only_unlinked=${onlyUnlinked}`),
    getBookingBot: (id: number) =>
        requests.get<BookingBotItem>(`/admin/booking/bots/${id}`),
    registerBookingBot: (body: {
        slug: string
        token: string
        name?: string
        username?: string
        bot_type?: string
        mini_app_url?: string
    }) => requests.post<BookingBotItem>('/admin/booking/bots', body),
    updateBookingBot: (id: number, body: BookingBotUpdate) =>
        requests.patch<BookingBotUpdateResponse>(`/admin/booking/bots/${id}`, body),
    onboardBooking: (body: BookingOnboardRequest) =>
        requests.post<BookingOnboardResponse>('/admin/booking/onboard', body),
    linkBookingBot: (body: BookingLinkRequest) =>
        requests.post<BookingLinkResponse>('/admin/booking/link', body),
}
