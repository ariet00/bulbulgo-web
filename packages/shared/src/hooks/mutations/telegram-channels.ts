import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
    telegramChannelsApi,
    type TelegramChannelCreate,
    type TelegramChannelUpdate,
} from '../../apis/telegram-channels'
import { telegramChannelKeys } from '../queries/telegram-channels'

export const useCreateTelegramChannel = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: TelegramChannelCreate) => telegramChannelsApi.createChannel(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: telegramChannelKeys.all })
            toast.success('Канал создан')
        },
        onError: () => toast.error('Не удалось создать канал'),
    })
}

export const useUpdateTelegramChannel = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: TelegramChannelUpdate }) =>
            telegramChannelsApi.updateChannel(id, body),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: telegramChannelKeys.list() })
            qc.invalidateQueries({ queryKey: telegramChannelKeys.item(id) })
            toast.success('Канал обновлён')
        },
        onError: () => toast.error('Не удалось обновить канал'),
    })
}

export const useDeleteTelegramChannel = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => telegramChannelsApi.deleteChannel(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: telegramChannelKeys.all })
            toast.success('Канал удалён')
        },
        onError: () => toast.error('Не удалось удалить канал'),
    })
}
