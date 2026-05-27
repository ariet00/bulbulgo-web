import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    adminApi,
    AdminAppFeaturesSettings,
    AdminAppVersionSettings,
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
} from '../../apis/admin'
import { adminKeys } from '../queries/admin'
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
