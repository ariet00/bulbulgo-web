import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    adminApi,
    AdminAdCreate,
    AdminAdUpdate,
    AdminServiceCreate,
    AdminServiceUpdate,
    AdminComplaintStatus,
    AdminComplaintReasonInput,
    AdminNewsInput,
    AdminAppFeaturesSettings,
    AdminAppVersionSettings,
    AdminMaintenanceSettings,
    AdminContactLimitsSettings,
    AdminBumpLimitsSettings,
    AdminActiveLimitsSettings,
    AdminServicePrices,
    AdminParcelTypesSettings,
    AdminAttractivePricesSettings,
    AdminSubscriptionSettings,
    AdminPhoneViewSettings,
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
    AnalyticsCleanupConfigInput,
    AdminRegionInput,
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

export const useUpdateAdminUserFeatures = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            overrides,
        }: {
            id: number
            overrides: Record<string, boolean | null>
        }) => adminApi.updateUserFeatures(id, overrides),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({
                queryKey: [...adminKeys.user(id), 'features'],
            })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminUserPreBlockWarning = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            enabled,
            message,
            rules_url,
        }: {
            id: number
            enabled: boolean
            message: string | null
            rules_url: string | null
        }) =>
            adminApi.updateUserPreBlockWarning(id, {
                enabled,
                message,
                rules_url,
            }),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({
                queryKey: [...adminKeys.user(id), 'pre-block-warning'],
            })
            queryClient.invalidateQueries({ queryKey: adminKeys.user(id) })
            toast.success('Сохранено')
        },
    })
}

// === Complaints (user reports) ===
export const useAdminSetComplaintStatus = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: AdminComplaintStatus }) =>
            adminApi.setComplaintStatus(id, status),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: adminKeys.complaints() })
            qc.invalidateQueries({ queryKey: adminKeys.complaint(id) })
            toast.success('Статус жалобы обновлён')
        },
    })
}

export const useAdminDeleteComplaint = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteComplaint(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaints() })
            toast.success('Жалоба удалена')
        },
    })
}

// === Complaint reasons dictionary ===
export const useAdminCreateComplaintReason = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminComplaintReasonInput) => adminApi.createComplaintReason(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaintReasons() })
            toast.success('Тип жалобы добавлен')
        },
    })
}

export const useAdminUpdateComplaintReason = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...body }: { id: number } & Partial<AdminComplaintReasonInput>) =>
            adminApi.updateComplaintReason(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaintReasons() })
            toast.success('Тип жалобы обновлён')
        },
    })
}

export const useAdminDeleteComplaintReason = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteComplaintReason(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaintReasons() })
            toast.success('Тип жалобы удалён')
        },
    })
}

export const useAdminReorderComplaintReasons = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (ids: number[]) => adminApi.reorderComplaintReasons(ids),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaintReasons() })
        },
    })
}

// === BulBul Go news ===
export const useAdminCreateNews = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminNewsInput) => adminApi.createNews(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.news() })
            toast.success('Новость создана')
        },
    })
}

export const useAdminUpdateNews = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...body }: { id: number } & Partial<AdminNewsInput>) =>
            adminApi.updateNews(id, body),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: adminKeys.news() })
            qc.invalidateQueries({ queryKey: adminKeys.newsItem(id) })
            toast.success('Новость сохранена')
        },
    })
}

export const useAdminDeleteNews = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteNews(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.news() })
            toast.success('Новость удалена')
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

export const useAdminSetTripServiceUntil = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            service_type,
            until,
        }: {
            id: number
            service_type: string
            until: string
        }) => adminApi.setTripServiceUntil(id, { service_type, until }),
        onSuccess: (data, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.trip(id) })
            queryClient.invalidateQueries({ queryKey: adminKeys.trips() })
            toast.success(data.active ? 'Срок услуги обновлён' : 'Услуга деактивирована')
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

export const useAdminBlockAuthor = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: {
            author_id: number
            username?: string | null
            name?: string | null
            trip_id?: number | null
        }) => adminApi.blockAuthor(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.blockedAuthors() })
            toast.success('Автор заблокирован — его посты парсер пропускает')
        },
    })
}

export const useAdminUnblockAuthor = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (authorId: number) => adminApi.unblockAuthor(authorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.blockedAuthors() })
            toast.success('Автор разблокирован')
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

// === Mobile app services (home hub / tabs / webview) ===

export const useAdminCreateService = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminServiceCreate) => adminApi.createService(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.services() })
            toast.success('Сервис создан')
        },
    })
}

export const useAdminUpdateService = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminServiceUpdate }) =>
            adminApi.updateService(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.services() })
            toast.success('Сервис обновлён')
        },
    })
}

export const useAdminDeleteService = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteService(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.services() })
            toast.success('Сервис удалён')
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

export const useSetAnalyticsCleanupConfig = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AnalyticsCleanupConfigInput) =>
            adminApi.setAnalyticsCleanupConfig(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Настройки очистки сохранены')
        },
    })
}

export const useRunAnalyticsCleanup = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: () => adminApi.runAnalyticsCleanup(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Очистка запущена')
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

export const useUpdateAdminMaintenanceSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminMaintenanceSettings) =>
            adminApi.updateMaintenanceSettings(body),
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

export const useUpdateAdminBumpLimitsSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminBumpLimitsSettings) =>
            adminApi.updateBumpLimitsSettings(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.appSettings() })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminActiveLimitsSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminActiveLimitsSettings) =>
            adminApi.updateActiveLimitsSettings(body),
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

export const useUpdateAdminPhoneViewSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminPhoneViewSettings) =>
            adminApi.updatePhoneViewSettings(body),
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

export const useUpdateAdminAttractivePricesSettings = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminAttractivePricesSettings) =>
            adminApi.updateAttractivePricesSettings(body),
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

const invalidateRegions = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: [...adminKeys.all, 'regions'] })
    qc.invalidateQueries({ queryKey: [...adminKeys.all, 'region'] })
}

export const useCreateAdminRegion = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminRegionInput) => adminApi.createRegion(body),
        onSuccess: () => {
            invalidateRegions(qc)
            toast.success('Регион создан')
        },
    })
}

export const useUpdateAdminRegion = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: Partial<AdminRegionInput> }) =>
            adminApi.updateRegion(id, body),
        onSuccess: () => {
            invalidateRegions(qc)
            toast.success('Регион обновлён')
        },
    })
}
