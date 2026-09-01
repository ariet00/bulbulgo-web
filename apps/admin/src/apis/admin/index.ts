export type { LocalizedText } from './base'
export * from './regions'
export * from './users'
export * from './complaints'
export * from './reviews'
export * from './news'
export * from './ideas'
export * from './companies'
export * from './trips'
export * from './misc'
export * from './notifications'
export * from './promotions'
export * from './app-services'
export * from './service-groups'
export * from './analytics'
export * from './rideshare-analytics'
export * from './booking'
export * from './settings'
export * from './celery'
export * from './seeders'
export * from './referral'
export * from './reports'
export * from './currencies'
export * from './fuel'
export * from './moderation'
export * from './telegram'
export * from './tglab'

import { regionsAdminApi } from './regions'
import { usersAdminApi } from './users'
import { complaintsAdminApi } from './complaints'
import { reviewsAdminApi } from './reviews'
import { newsAdminApi } from './news'
import { ideasAdminApi } from './ideas'
import { companiesAdminApi } from './companies'
import { tripsAdminApi } from './trips'
import { miscAdminApi } from './misc'
import { notificationsAdminApi } from './notifications'
import { promotionsAdminApi } from './promotions'
import { appServicesAdminApi } from './app-services'
import { serviceGroupsAdminApi } from './service-groups'
import { analyticsAdminApi } from './analytics'
import { rideshareAnalyticsAdminApi } from './rideshare-analytics'
import { bookingAdminApi } from './booking'
import { settingsAdminApi } from './settings'
import { celeryAdminApi } from './celery'
import { seedersAdminApi } from './seeders'
import { referralAdminApi } from './referral'
import { reportsAdminApi } from './reports'
import { currenciesAdminApi } from './currencies'
import { fuelAdminApi } from './fuel'
import { moderationAdminApi } from './moderation'
import { telegramAdminApi } from './telegram'
import { tglabAdminApi } from './tglab'

// Единый объект-агрегат — публичный контракт `adminApi` не изменился.
export const adminApi = {
    ...regionsAdminApi,
    ...usersAdminApi,
    ...complaintsAdminApi,
    ...reviewsAdminApi,
    ...newsAdminApi,
    ...ideasAdminApi,
    ...companiesAdminApi,
    ...tripsAdminApi,
    ...miscAdminApi,
    ...notificationsAdminApi,
    ...promotionsAdminApi,
    ...appServicesAdminApi,
    ...serviceGroupsAdminApi,
    ...analyticsAdminApi,
    ...rideshareAnalyticsAdminApi,
    ...bookingAdminApi,
    ...settingsAdminApi,
    ...celeryAdminApi,
    ...seedersAdminApi,
    ...referralAdminApi,
    ...reportsAdminApi,
    ...fuelAdminApi,
    ...currenciesAdminApi,
    ...moderationAdminApi,
    ...telegramAdminApi,
    ...tglabAdminApi,
}
