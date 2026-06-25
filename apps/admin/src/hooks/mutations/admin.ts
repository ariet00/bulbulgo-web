import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    adminApi,
    AdminAdCreate,
    AdminAdUpdate,
    AdminAppFeaturesSettings,
    AdminAppVersionSettings,
    AdminContactLimitsSettings,
    AdminServicePrices,
    AdminParcelTypesSettings,
    AdminSubscriptionSettings,
    AdminBroadcastNotification,
    AdminCompanyCreate,
    AdminCompanyUpdate,
    AdminScheduleNotification,
    AdminSendNotification,
    BookingBotUpdate,
    BookingLinkRequest,
    BookingOnboardRequest,
    CeleryPeriodicTaskCreate,
    CeleryPeriodicTaskUpdate,
} from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminBanUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            adminApi.banUser(id, isActive),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users() })
            queryClient.invalidateQueries({ queryKey: adminKeys.user(id) })
            toast.success('User status updated')
        },
    })
}

export const useAdminDeleteCompany = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.companies() })
            queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Company deleted')
        },
    })
}

export const useAdminCreateCompany = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminCompanyCreate) => adminApi.createCompany(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.companies() })
            toast.success('Компания создана')
        },
    })
}

export const useAdminUpdateCompany = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminCompanyUpdate }) =>
            adminApi.updateCompany(id, body),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: adminKeys.companies() })
            qc.invalidateQueries({ queryKey: adminKeys.company(id) })
            toast.success('Компания обновлена')
        },
    })
}

export const useAdminDeleteTrip = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteTrip(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.trips() })
            queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Trip deleted')
        },
    })
}

export const useAdminUpdateTripStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            adminApi.updateTripStatus(id, status),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.trips() })
            queryClient.invalidateQueries({ queryKey: adminKeys.trip(id) })
            queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Статус поездки обновлён')
        },
    })
}

export const useAdminSetTripSubscriptionActive = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            adminApi.setTripSubscriptionActive(id, isActive),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.subscriptions() })
            toast.success('Подписка обновлена')
        },
    })
}

export const useAdminDeleteTripSubscription = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteTripSubscription(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.subscriptions() })
            toast.success('Подписка удалена')
        },
    })
}

export const useAdminDeleteVehicle = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteVehicle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.vehicles() })
            queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Vehicle deleted')
        },
    })
}

export const useAdminCreateProperty = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => adminApi.createProperty(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
            toast.success('Property created')
        },
    })
}

export const useAdminUpdateProperty = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            adminApi.updateProperty(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
            queryClient.invalidateQueries({ queryKey: adminKeys.property(id) })
            toast.success('Property updated')
        },
    })
}

export const useAdminDeleteProperty = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteProperty(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
            toast.success('Property deleted')
        },
    })
}

const invalidateBookingBots = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: [...adminKeys.all, 'booking-bots'] })
}

export const useAdminRegisterBookingBot = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: {
            slug: string
            token: string
            name?: string
            username?: string
            bot_type?: string
            mini_app_url?: string
        }) => adminApi.registerBookingBot(body),
        onSuccess: () => {
            invalidateBookingBots(qc)
            toast.success('Bot registered')
        },
    })
}

export const useAdminOnboardBooking = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: BookingOnboardRequest) => adminApi.onboardBooking(body),
        onSuccess: () => {
            invalidateBookingBots(qc)
            qc.invalidateQueries({ queryKey: adminKeys.companies() })
            toast.success('Бизнес создан и привязан к боту')
        },
    })
}

export const useAdminLinkBookingBot = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: BookingLinkRequest) => adminApi.linkBookingBot(body),
        onSuccess: () => {
            invalidateBookingBots(qc)
            qc.invalidateQueries({ queryKey: adminKeys.companies() })
            toast.success('Бот привязан к компании')
        },
    })
}

export const useAdminUpdateBookingBot = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: BookingBotUpdate }) =>
            adminApi.updateBookingBot(id, body),
        onSuccess: (res, { id }) => {
            invalidateBookingBots(qc)
            qc.invalidateQueries({ queryKey: adminKeys.bookingBot(id) })
            qc.invalidateQueries({ queryKey: adminKeys.companies() })
            if (res.needs_booking_settings) {
                toast.warning('У компании нет booking-настроек — создайте их.')
            } else {
                toast.success('Бот обновлён')
            }
        },
    })
}

// === Celery beat ===
const invalidateCeleryTasks = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: adminKeys.celeryTasks() })
}

export const useAdminCreateCeleryTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: CeleryPeriodicTaskCreate) => adminApi.createCeleryTask(body),
        onSuccess: () => {
            invalidateCeleryTasks(qc)
            toast.success('Periodic task created')
        },
    })
}

export const useAdminUpdateCeleryTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: CeleryPeriodicTaskUpdate }) =>
            adminApi.updateCeleryTask(id, body),
        onSuccess: (_, { id }) => {
            invalidateCeleryTasks(qc)
            qc.invalidateQueries({ queryKey: adminKeys.celeryTask(id) })
        },
    })
}

export const useAdminDeleteCeleryTask = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteCeleryTask(id),
        onSuccess: () => {
            invalidateCeleryTasks(qc)
            toast.success('Periodic task deleted')
        },
    })
}

// === Notifications ===
export const useAdminSendNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminSendNotification) => adminApi.sendNotification(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Уведомление поставлено в очередь')
        },
    })
}

export const useAdminBroadcastNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminBroadcastNotification) => adminApi.broadcastNotification(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Рассылка поставлена в очередь')
        },
    })
}

export const useAdminDeleteNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteNotification(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Уведомление удалено')
        },
    })
}

// === Promotions (in-app custom ads) ===

export const useAdminCreateAd = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminAdCreate) => adminApi.createAd(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.ads() })
            toast.success('Реклама создана')
        },
    })
}

export const useAdminUpdateAd = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminAdUpdate }) =>
            adminApi.updateAd(id, body),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: adminKeys.ads() })
            qc.invalidateQueries({ queryKey: adminKeys.ad(id) })
            toast.success('Реклама обновлена')
        },
    })
}

export const useAdminDeleteAd = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteAd(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.ads() })
            toast.success('Реклама удалена')
        },
    })
}

export const useAdminScheduleNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminScheduleNotification) => adminApi.scheduleNotification(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Уведомление запланировано')
        },
    })
}

export const useAdminCancelScheduledNotification = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.cancelScheduledNotification(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.notifications() })
            toast.success('Отменено')
        },
    })
}

export const useAdminRefreshCeleryBeat = () => {
    return useMutation({
        mutationFn: () => adminApi.refreshCeleryBeat(),
        onSuccess: (res) => {
            if (res.ok) toast.success('Beat reload signalled')
            else toast.message(`Beat not reloaded: ${res.reason ?? 'unknown'}`)
        },
    })
}

export const useSetAnalyticsMiddlewareToggle = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (enabled: boolean) => adminApi.setAnalyticsMiddlewareToggle(enabled),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.analytics() })
        },
    })
}

export const useUpdateAdminAppVersionSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminAppVersionSettings) =>
            adminApi.updateAppVersionSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminAppFeaturesSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminAppFeaturesSettings) =>
            adminApi.updateAppFeaturesSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminContactLimitsSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminContactLimitsSettings) =>
            adminApi.updateContactLimitsSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminSubscriptionSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminSubscriptionSettings) =>
            adminApi.updateSubscriptionSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminServicePricesSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminServicePrices) =>
            adminApi.updateServicePricesSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminParcelTypesSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminParcelTypesSettings) =>
            adminApi.updateParcelTypesSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

// Per-driver limit overrides (from the BulBul Go "limited drivers" card and the
// per-user analytics page). Refresh both the list and the single-user summary.
const invalidateLimitedDrivers = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: [...adminKeys.analytics(), 'rideshare', 'limited-drivers'] })
    qc.invalidateQueries({ queryKey: [...adminKeys.analytics(), 'user-limit'] })
}

export const useSetDriverCredits = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, value }: { userId: number; value: number }) =>
            adminApi.setDriverCredits(userId, { value }),
        onSuccess: () => {
            invalidateLimitedDrivers(qc)
            toast.success('Кредиты обновлены')
        },
    })
}

export const useSetDriverFreeUsed = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, value }: { userId: number; value: number }) =>
            adminApi.setDriverFreeUsed(userId, { value }),
        onSuccess: () => {
            invalidateLimitedDrivers(qc)
            toast.success('Free-лимит обновлён')
        },
    })
}

export const useSetDriverLimited = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, value }: { userId: number; value: number | null }) =>
            adminApi.setDriverLimited(userId, value),
        onSuccess: () => {
            invalidateLimitedDrivers(qc)
            toast.success('Статус лимита обновлён')
        },
    })
}
