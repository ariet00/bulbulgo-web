import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminBookingBots = (onlyUnlinked = false) => {
    return useQuery({
        queryKey: adminKeys.bookingBots(onlyUnlinked),
        queryFn: () => adminApi.getBookingBots(onlyUnlinked),
    })
}

export const useAdminBookingBot = (id: number) => {
    return useQuery({
        queryKey: adminKeys.bookingBot(id),
        queryFn: () => adminApi.getBookingBot(id),
        enabled: !!id,
    })
}
