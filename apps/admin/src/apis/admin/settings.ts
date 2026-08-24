import { requests } from './base'

export interface AdminSubscriptionSettings {
    max_count: number
    max_expire_days: number
}

export interface AdminPhoneViewSettings {
    window_hours: number
}

// === Complaints (user reports) ===

export interface AdminAppVersionSettings {
    set_version_header: boolean
    android_min_version: string
    ios_min_version: string
    android_recommended_version: string
    ios_recommended_version: string
    // Legacy — для старых клиентов, читающих GET /version (удалим в будущем).
    android_force_update: boolean
    ios_force_update: boolean
}

export interface AdminMaintenanceSettings {
    enabled: boolean
    message: string
}

export interface AdminAppFeaturesSettings {
    is_wallet_top_up_enabled: boolean
    is_wallet_enabled: boolean
    is_passenger_search_enabled: boolean
    map_route_preview: boolean
    /** Легаси-копия для старых сборок (читают из /me); гейты — в правилах создания. */
    require_verified_phone: boolean
    phone_login_enabled: boolean
    phone_view_insights_enabled: boolean
    phone_view_show_viewer_phone: boolean
    bookings_tab_enabled: boolean
    sort_trips_by_distance: boolean
    /**
     * Мин. версии приложения per-флаг, например {"phone_login_enabled": "1.0.92"}.
     * Мобильный клиент ниже версии видит флаг выключенным; нет ключа = все версии.
     */
    min_versions: Record<string, string>
}

// Per-user feature-flag overrides. `overrides` holds only the flags explicitly
// set for this user (true/false); everything else inherits `global_features`.

export interface AdminAutoBumpTariff {
    id: string
    label: string
    interval_hours: number
    duration_days: number
    price: number
}

export interface AdminUrgentTariff {
    id: string
    label: string
    duration_days: number
    price: number
}

/** Роли объявлений, для которых услуга доступна. */
export type ServiceRole = 'driver' | 'passenger' | 'parcel'

export interface AdminServicePrices {
    auto_bump_enabled: boolean
    auto_bump_title: string
    auto_bump_short_description: string
    auto_bump_description: string
    auto_bump_tariffs: AdminAutoBumpTariff[]
    auto_bump_roles: ServiceRole[]
    urgent_enabled: boolean
    urgent_title: string
    urgent_short_description: string
    urgent_description: string
    urgent_tariffs: AdminUrgentTariff[]
    urgent_roles: ServiceRole[]
    urgent_price: number
    urgent_duration_days: number
}

export interface AdminParcelType {
    code: string
    name: string
    weight_hint: string
    price: number | null
    negotiable: boolean
}

export interface AdminParcelTypesSettings {
    enabled: boolean
    types: AdminParcelType[]
}

export interface AdminSupportSettings {
    in_app_enabled: boolean
    tg_enabled: boolean
    tg_url: string | null
    wa_enabled: boolean
    // Номер WhatsApp. Бэкенд нормализует его в E.164 (`+996…`) при сохранении
    // и отвечает 400, если номер не разобрался.
    wa_phone: string | null
}

// service -> role -> [phrases]
export type AdminQuickMessages = Record<string, Record<string, string[]>>

export interface AdminAttractiveRoute {
    from_location_id: number
    to_location_id: number
    min_price: number
    max_price: number
}

export interface AdminAttractivePricesSettings {
    /** Гейтит только массовую рассылку. */
    enabled: boolean
    /** Гейтит бесплатную услугу «Выгодная поездка» (поднятия + репост в группу). */
    service_enabled: boolean
    service_duration_hours: number
    service_interval_hours: number
    routes: AdminAttractiveRoute[]
}

export interface AdminContactLimitsSettings {
    enabled: boolean
    free_daily_limit: number
    global_free_daily_limit: number
    daily_reset_hour: number
    fast_freshness_minutes: number
    fast_cost: number
    activity_window_days: number
    activity_min_views: number
    activity_min_active_days: number
    package_views: number
    package_price: number
    package_currency: string
}

export interface AdminBumpLimitsSettings {
    enabled: boolean
    max_count: number
    window_seconds: number
    dedup_window_seconds: number
}

export interface AdminActiveLimitsSettings {
    enabled: boolean
    max_active_total: number
    max_active_per_direction: number
}

export interface AdminTripCreateRoleRules {
    max_duration_hours: number
    default_duration_hours: number
    price_required: boolean
    time_required: boolean
    /** Показывать кнопку «Составить расписание» в пикере даты. */
    schedule_enabled: boolean
    /** Показывать промежуточные точки в шаге маршрута. */
    waypoints_enabled: boolean
}

export interface AdminFreightCreateRules {
    driver: AdminTripCreateRoleRules
    cargo_owner: AdminTripCreateRoleRules
}

export interface AdminTripCreateRulesSettings {
    /** Публиковать может только пользователь с подтверждённым номером. */
    require_verified_phone: boolean
    /** Показывать блок «Как могут с вами связаться» (попутки + грузы). */
    contact_method_enabled: boolean
    driver: AdminTripCreateRoleRules
    passenger: AdminTripCreateRoleRules
    parcel: AdminTripCreateRoleRules
    freight: AdminFreightCreateRules
}

export interface CeleryCrontab {
    id?: number | null
    minute: string
    hour: string
    day_of_week: string
    day_of_month: string
    month_of_year: string
    timezone: string
}

export interface CeleryInterval {
    id?: number | null
    every: number
    period: 'seconds' | 'minutes' | 'hours' | 'days'
}

export interface CeleryPeriodicTask {
    id: number
    name: string
    task: string
    args: string
    kwargs: string
    queue: string | null
    enabled: boolean
    one_off: boolean
    expire_seconds: number | null
    last_run_at: string | null
    total_run_count: number
    date_changed: string | null
    description: string | null
    crontab: CeleryCrontab | null
    interval: CeleryInterval | null
}

export interface CeleryPeriodicTaskCreate {
    name: string
    task: string
    args?: string
    kwargs?: string
    queue?: string | null
    enabled?: boolean
    one_off?: boolean
    description?: string | null
    crontab?: CeleryCrontab | null
    interval?: CeleryInterval | null
}

export interface CeleryPeriodicTaskUpdate {
    name?: string
    task?: string
    args?: string
    kwargs?: string
    queue?: string | null
    enabled?: boolean
    one_off?: boolean
    description?: string | null
    crontab?: CeleryCrontab | null
    interval?: CeleryInterval | null
}

export const settingsAdminApi = {
    // Celery beat — periodic tasks
    listCeleryTasks: () =>
        requests.get<CeleryPeriodicTask[]>('/admin/celery/periodic-tasks'),
    getCeleryTask: (id: number) =>
        requests.get<CeleryPeriodicTask>(`/admin/celery/periodic-tasks/${id}`),
    createCeleryTask: (body: CeleryPeriodicTaskCreate) =>
        requests.post<CeleryPeriodicTask>('/admin/celery/periodic-tasks', body),
    updateCeleryTask: (id: number, body: CeleryPeriodicTaskUpdate) =>
        requests.patch<CeleryPeriodicTask>(`/admin/celery/periodic-tasks/${id}`, body),
    deleteCeleryTask: (id: number) =>
        requests.delete<any>(`/admin/celery/periodic-tasks/${id}`),
    refreshCeleryBeat: () =>
        requests.post<{ ok: boolean; reason?: string }>('/admin/celery/refresh-beat', {}),

    // App settings (mobile-app version gating)
    getAppVersionSettings: () =>
        requests.get<AdminAppVersionSettings>('/admin/settings/version'),
    updateAppVersionSettings: (body: AdminAppVersionSettings) =>
        requests.put<AdminAppVersionSettings>('/admin/settings/version', body),

    // App settings (maintenance mode — Redis key `app:maintenance_mode`)
    getMaintenanceSettings: () =>
        requests.get<AdminMaintenanceSettings>('/admin/settings/maintenance'),
    updateMaintenanceSettings: (body: AdminMaintenanceSettings) =>
        requests.put<AdminMaintenanceSettings>('/admin/settings/maintenance', body),

    // App settings (global feature flags — Redis key `app:features`)
    getAppFeaturesSettings: () =>
        requests.get<AdminAppFeaturesSettings>('/admin/settings/features'),
    updateAppFeaturesSettings: (body: AdminAppFeaturesSettings) =>
        requests.put<AdminAppFeaturesSettings>('/admin/settings/features', body),

    // Driver phone-view rate limits (Redis key `app:contact_limits`)
    getContactLimitsSettings: () =>
        requests.get<AdminContactLimitsSettings>('/admin/settings/contact-limits'),
    updateContactLimitsSettings: (body: AdminContactLimitsSettings) =>
        requests.put<AdminContactLimitsSettings>('/admin/settings/contact-limits', body),

    // Per-user bump rate limit (Redis key `app:bump_limits`)
    getBumpLimitsSettings: () =>
        requests.get<AdminBumpLimitsSettings>('/admin/settings/bump-limits'),
    updateBumpLimitsSettings: (body: AdminBumpLimitsSettings) =>
        requests.put<AdminBumpLimitsSettings>('/admin/settings/bump-limits', body),

    // Trip-create form rules per role (Redis key `app:trip_create_rules`)
    getTripCreateRulesSettings: () =>
        requests.get<AdminTripCreateRulesSettings>('/admin/settings/trip-create-rules'),
    updateTripCreateRulesSettings: (body: AdminTripCreateRulesSettings) =>
        requests.put<AdminTripCreateRulesSettings>('/admin/settings/trip-create-rules', body),

    // Per-user active-listings limit (Redis key `app:active_limits`)
    getActiveLimitsSettings: () =>
        requests.get<AdminActiveLimitsSettings>('/admin/settings/active-limits'),
    updateActiveLimitsSettings: (body: AdminActiveLimitsSettings) =>
        requests.put<AdminActiveLimitsSettings>('/admin/settings/active-limits', body),

    // Trip-subscription limits (inside Redis dict `app:settings`)
    getSubscriptionSettings: () =>
        requests.get<AdminSubscriptionSettings>('/admin/settings/subscriptions'),
    updateSubscriptionSettings: (body: AdminSubscriptionSettings) =>
        requests.put<AdminSubscriptionSettings>('/admin/settings/subscriptions', body),

    // "Просмотры номеров" window in hours (inside Redis dict `app:settings`)
    getPhoneViewSettings: () =>
        requests.get<AdminPhoneViewSettings>('/admin/settings/phone-views'),
    updatePhoneViewSettings: (body: AdminPhoneViewSettings) =>
        requests.put<AdminPhoneViewSettings>('/admin/settings/phone-views', body),

    // Premium-service prices/tariffs (Redis key `app:service_prices`)
    getServicePricesSettings: () =>
        requests.get<AdminServicePrices>('/admin/settings/service-prices'),
    updateServicePricesSettings: (body: AdminServicePrices) =>
        requests.put<AdminServicePrices>('/admin/settings/service-prices', body),

    // Parcel types for courier delivery (Redis key `app:parcel_types`)
    getParcelTypesSettings: () =>
        requests.get<AdminParcelTypesSettings>('/admin/settings/parcel-types'),
    updateParcelTypesSettings: (body: AdminParcelTypesSettings) =>
        requests.put<AdminParcelTypesSettings>('/admin/settings/parcel-types', body),

    // Support contact channels (Redis key `app:support`)
    getSupportSettings: () =>
        requests.get<AdminSupportSettings>('/admin/settings/support'),
    updateSupportSettings: (body: AdminSupportSettings) =>
        requests.put<AdminSupportSettings>('/admin/settings/support', body),

    // Quick messages (Redis key `app:quick_messages`): service -> role -> phrases
    getQuickMessages: () =>
        requests.get<AdminQuickMessages>('/admin/settings/quick-messages'),
    updateQuickMessages: (body: AdminQuickMessages) =>
        requests.put<AdminQuickMessages>('/admin/settings/quick-messages', body),
    getAttractivePricesSettings: () =>
        requests.get<AdminAttractivePricesSettings>('/admin/settings/attractive-prices'),
    updateAttractivePricesSettings: (body: AdminAttractivePricesSettings) =>
        requests.put<AdminAttractivePricesSettings>('/admin/settings/attractive-prices', body),
}
