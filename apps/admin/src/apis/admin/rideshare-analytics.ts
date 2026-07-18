import { requests } from './base'
import type { AdminUserLimit } from './users'

export const rideshareAnalyticsAdminApi = {
    // Rideshare (bulbul go) — product-specific analytics
    getRideshareFunnel: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            steps: Array<{
                key: string
                label: string
                event_type: string
                events: number
                users: number
            }>
        }>(`/admin/rideshare/analytics/funnel?period=${period}`),
    getRideshareSummary: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            active_now: number
            active_by_type: Array<{ trip_type: string | null; count: number }>
            active_by_role: Array<{ role: string | null; count: number }>
            created_in_period: number
            completed_in_period: number
            cancelled_in_period: number
            completion_rate: number
        }>(`/admin/rideshare/analytics/summary?period=${period}`),
    getRideshareTripsByDay: (period: string = '7d', groupBy: 'type' | 'role' = 'type') =>
        requests.get<{
            period: string
            from_: string
            to: string
            granularity: 'minute' | 'hour' | 'day'
            group_by: 'type' | 'role'
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            trip_types: string[]
        }>(`/admin/rideshare/analytics/trips-by-day?period=${period}&group_by=${groupBy}`),
    getRideshareInstallsByDay: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            granularity: 'minute' | 'hour' | 'day'
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            event_types: string[]
        }>(`/admin/rideshare/analytics/installs-by-day?period=${period}`),
    getRideshareTopDrivers: (
        period: string = '7d',
        limit: number = 20,
        sortBy: 'trips_created' | 'phone_views' | 'trip_views' = 'trips_created',
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            drivers: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                trips: number
                completed: number
                trips_driver: number
                trips_passenger: number
                phone_views_received: number
                phone_views_made: number
                phone_views_made_driver: number
                phone_views_made_passenger: number
                phone_views_fast_made: number
                trip_views_received: number
                trip_views_made: number
                trip_views_made_driver: number
                trip_views_made_passenger: number
            }>
        }>(
            `/admin/rideshare/analytics/top-drivers?period=${period}&limit=${limit}&sort_by=${sortBy}`,
        ),
    getRideshareTopActiveUsers: (period: string = '7d', limit: number = 20) =>
        requests.get<{
            period: string
            from_: string
            to: string
            users: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                events: number
                active_days: number
            }>
        }>(`/admin/rideshare/analytics/top-active-users?period=${period}&limit=${limit}`),
    getRideshareTopRoutes: (period: string = '7d', limit: number = 20) =>
        requests.get<{
            period: string
            from_: string
            to: string
            routes: Array<{
                from_id: number
                from_name: string | null
                to_id: number
                to_name: string | null
                trips: number
                completed: number
            }>
        }>(`/admin/rideshare/analytics/top-routes?period=${period}&limit=${limit}`),
    getRideshareDemandSupply: (
        period: string = '7d',
        limit: number = 30,
        sortBy: 'searches' | 'empty' = 'searches',
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            total_searches: number
            unique_searchers: number
            empty_searches: number
            routes: Array<{
                from_id: number
                from_name: string | null
                to_id: number
                to_name: string | null
                searches: number
                searchers: number
                empty_searches: number
                active_trips: number
                created_trips: number
            }>
        }>(
            `/admin/rideshare/analytics/demand-supply?period=${period}&limit=${limit}&sort_by=${sortBy}`,
        ),
    getRideshareServicesReport: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            services: Array<{
                service_type: string
                viewed: number
                viewed_users: number
                activated: number
                activated_users: number
                repeat_buyers: number
                revenue: number
                failed: number
            }>
            failures: Array<{
                service_type: string | null
                reason: string | null
                count: number
            }>
        }>(`/admin/rideshare/analytics/services-report?period=${period}`),
    getRideshareServiceEffect: (period: string = '30d', windowHours: number = 24) =>
        requests.get<{
            period: string
            from_: string
            to: string
            window_hours: number
            sample_limit: number
            rows: Array<{
                kind: string
                label: string
                analyzed: number
                trip_views_before: number
                trip_views_after: number
                phone_views_before: number
                phone_views_after: number
                improved: number
            }>
        }>(
            `/admin/rideshare/analytics/service-effect?period=${period}&window_hours=${windowHours}`,
        ),
    getRideshareOnboardingFunnel: (period: string = '30d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            steps: Array<{ key: string; label: string; count: number }>
        }>(`/admin/rideshare/analytics/onboarding-funnel?period=${period}`),
    getRideshareRetentionCohorts: (weeks: number = 8) =>
        requests.get<{
            weeks: number
            cohorts: Array<{
                week: string
                users: number
                d1: number
                d7: number
                d30: number
            }>
        }>(`/admin/rideshare/analytics/retention-cohorts?weeks=${weeks}`),
    getRidesharePushReport: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            granularity: 'minute' | 'hour' | 'day'
            sent: number
            delivered: number
            failed: number
            read: number
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            categories: Array<{
                category: string | null
                sent: number
                delivered: number
                failed: number
                read: number
            }>
            permissions: Array<{
                platform: string | null
                status: string | null
                count: number
            }>
        }>(`/admin/rideshare/analytics/push-report?period=${period}`),
    getRideshareTopBumpers: (period: string = '7d', limit: number = 20) =>
        requests.get<{
            period: string
            from_: string
            to: string
            users: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                bumps: number
                trips_bumped: number
                active_days: number
            }>
        }>(`/admin/rideshare/analytics/top-bumpers?period=${period}&limit=${limit}`),
    getRideshareTopServiceBuyers: (
        period: string = '30d',
        limit: number = 20,
        sortBy: 'spend' | 'activations' = 'spend',
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            users: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                activations: number
                spend: number
                auto_bump: number
                urgent: number
                last_activated_at: string | null
            }>
        }>(
            `/admin/rideshare/analytics/top-service-buyers?period=${period}&limit=${limit}&sort_by=${sortBy}`,
        ),
    getRideshareEventRetention: (event: string, period: string = '30d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            event_type: string
            label: string
            users: number
            returned_1d: number
            eligible_1d: number
            returned_7d: number
            eligible_7d: number
            returned_30d: number
            eligible_30d: number
            available_events: Record<string, string>
        }>(`/admin/rideshare/analytics/event-retention?event=${event}&period=${period}`),
    getRideshareLimitedDrivers: (
        page: number = 1,
        size: number = 20,
        opts?: {
            tier?: 'strict' | 'general'
            hasCredits?: boolean
            onlyLimitReached?: boolean
            sortBy?:
                | 'window_views'
                | 'free_used'
                | 'credits_balance'
                | 'active_days'
                | 'limit_reached_today'
                | 'last_online_at'
        },
    ) =>
        requests.get<{
            config: {
                enabled: boolean
                free_daily_limit: number
                global_free_daily_limit: number
                fast_cost: number
                activity_window_days: number
                activity_min_views: number
                activity_min_active_days: number
            }
            drivers: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                window_views: number
                active_days: number
                is_limited: boolean
                limit_override: boolean | null
                free_used: number
                free_limit: number
                free_remaining: number
                credits_balance: number
                limit_reached_today: number
                limit_reached_last_at: string | null
                last_online_at: string | null
            }>
            total: number
            page: number
            size: number
        }>(
            `/admin/rideshare/analytics/limited-drivers?page=${page}&size=${size}` +
                (opts?.tier ? `&tier=${opts.tier}` : '') +
                (opts?.hasCredits ? `&has_credits=true` : '') +
                (opts?.onlyLimitReached ? `&only_limit_reached=true` : '') +
                (opts?.sortBy ? `&sort_by=${opts.sortBy}` : ''),
        ),
    // ── BulBul Go wallet reports (product='bulbulgo'), /admin/akcha/reports/* ──
    getWalletReportSummary: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            balance_by_currency: Array<{ currency: string; balance: number }>
            topups_sum: number
            topups_count: number
            spend_sum: number
            spend_count: number
            net_in_period: number
            active_wallets: number
            active_users: number
        }>(`/admin/akcha/reports/summary?period=${period}`),
    getWalletReportFlowByDay: (period: string = '7d') =>
        requests.get<{
            period: string
            from_: string
            to: string
            granularity: 'minute' | 'hour' | 'day'
            days: Array<{ day: string; total: number; events: Record<string, number> }>
            event_types: string[]
        }>(`/admin/akcha/reports/flow-by-day?period=${period}`),
    getWalletReportTopUsers: (
        period: string = '7d',
        metric: 'topups' | 'spend' | 'balance' = 'topups',
        limit: number = 20,
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            metric: string
            users: Array<{
                user_id: number
                name: string | null
                phone: string | null
                avatar_url: string | null
                topups: number
                topups_count: number
                spend: number
                spend_count: number
                balance: number
                last_tx_at: string | null
            }>
        }>(
            `/admin/akcha/reports/top-users?period=${period}&metric=${metric}&limit=${limit}`,
        ),
    getWalletRetention: (granularity: 'week' | 'month' = 'month', cohorts: number = 12) =>
        requests.get<{
            granularity: string
            cohorts: Array<{
                cohort: string
                users: number
                topups_sum: number
                returned: number[]
                max_observable: number
            }>
            max_offset: number
            payers: number
            repeat_payers: number
            repeat_rate: number
            avg_topups_per_payer: number
            median_days_to_second: number | null
        }>(
            `/admin/akcha/reports/retention?granularity=${granularity}&cohorts=${cohorts}`,
        ),
    getRideshareMultiAccountDevices: (
        period: string = '30d',
        page: number = 1,
        size: number = 20,
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            devices: Array<{
                device_id: string
                account_count: number
                events: number
                last_seen: string
                accounts: Array<{
                    user_id: number
                    name: string | null
                    phone: string | null
                    avatar_url: string | null
                    events: number
                    last_seen: string
                }>
            }>
            total: number
            page: number
            size: number
        }>(
            `/admin/rideshare/analytics/multi-account-devices?period=${period}&page=${page}&size=${size}`,
        ),
    getRideshareMultiAccountIps: (
        period: string = '30d',
        page: number = 1,
        size: number = 20,
    ) =>
        requests.get<{
            period: string
            from_: string
            to: string
            ips: Array<{
                ip_address: string
                account_count: number
                events: number
                last_seen: string
                accounts: Array<{
                    user_id: number
                    name: string | null
                    phone: string | null
                    avatar_url: string | null
                    events: number
                    last_seen: string
                }>
            }>
            total: number
            page: number
            size: number
        }>(
            `/admin/rideshare/analytics/multi-account-ips?period=${period}&page=${page}&size=${size}`,
        ),
    getRideshareTopViewedTrips: (
        page: number = 1,
        size: number = 20,
        filters: { tripType?: string; role?: string; realOnly?: boolean } = {},
    ) =>
        requests.get<{
            total: number
            page: number
            size: number
            trips: Array<{
                trip_id: number
                trip_type: string | null
                role: string
                status: string
                from_name: string | null
                to_name: string | null
                price: number | null
                seats: number | null
                phone_view_count: number
                last_phone_view_at: string | null
                created_at: string
                owner_user_id: number | null
                owner_name: string | null
                owner_phone: string | null
            }>
        }>(
            `/admin/rideshare/analytics/top-viewed-trips?page=${page}&size=${size}` +
                (filters.tripType ? `&trip_type=${filters.tripType}` : '') +
                (filters.role ? `&role=${filters.role}` : '') +
                (filters.realOnly ? `&real_only=true` : ''),
        ),
    getUserLimit: (userId: number) =>
        requests.get<AdminUserLimit>(`/admin/rideshare/analytics/users/${userId}/limit`),
    setDriverCredits: (userId: number, body: { value: number }) =>
        requests.put<{ user_id: number; credits_balance: number }>(
            `/admin/rideshare/analytics/users/${userId}/credits`,
            body,
        ),
    setDriverFreeUsed: (userId: number, body: { value: number }) =>
        requests.put<{
            user_id: number
            free_used: number
            free_limit: number
            free_remaining: number
        }>(`/admin/rideshare/analytics/users/${userId}/free-used`, body),
    setDriverLimited: (userId: number, value: number | null) =>
        requests.put<{ user_id: number; limit_override: boolean | null }>(
            `/admin/rideshare/analytics/users/${userId}/limited`,
            { value },
        ),
}
