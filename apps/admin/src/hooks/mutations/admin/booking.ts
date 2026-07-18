import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, BookingBotUpdate, BookingLinkRequest, BookingOnboardRequest } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

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

