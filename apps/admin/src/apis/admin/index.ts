export type { LocalizedText } from './base'
export * from './regions'
export * from './users'
export * from './complaints'
export * from './news'
export * from './companies'
export * from './trips'
export * from './misc'
export * from './notifications'
export * from './promotions'
export * from './app-services'
export * from './analytics'
export * from './rideshare-analytics'
export * from './booking'
export * from './settings'
export * from './celery'
export * from './seeders'
export * from './referral'
export * from './reports'
export * from './fuel'

import { regionsAdminApi } from './regions'
import { usersAdminApi } from './users'
import { complaintsAdminApi } from './complaints'
import { newsAdminApi } from './news'
import { companiesAdminApi } from './companies'
import { tripsAdminApi } from './trips'
import { miscAdminApi } from './misc'
import { notificationsAdminApi } from './notifications'
import { promotionsAdminApi } from './promotions'
import { appServicesAdminApi } from './app-services'
import { analyticsAdminApi } from './analytics'
import { rideshareAnalyticsAdminApi } from './rideshare-analytics'
import { bookingAdminApi } from './booking'
import { settingsAdminApi } from './settings'
import { celeryAdminApi } from './celery'
import { seedersAdminApi } from './seeders'
import { referralAdminApi } from './referral'
import { reportsAdminApi } from './reports'
import { fuelAdminApi } from './fuel'

// Единый объект-агрегат — публичный контракт `adminApi` не изменился.
export const adminApi = {
    ...regionsAdminApi,
    ...usersAdminApi,
    ...complaintsAdminApi,
    ...newsAdminApi,
    ...companiesAdminApi,
    ...tripsAdminApi,
    ...miscAdminApi,
    ...notificationsAdminApi,
    ...promotionsAdminApi,
    ...appServicesAdminApi,
    ...analyticsAdminApi,
    ...rideshareAnalyticsAdminApi,
    ...bookingAdminApi,
    ...settingsAdminApi,
    ...celeryAdminApi,
    ...seedersAdminApi,
    ...referralAdminApi,
    ...reportsAdminApi,
    ...fuelAdminApi,
}
