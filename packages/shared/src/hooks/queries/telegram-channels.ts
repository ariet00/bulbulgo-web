import { useQuery } from '@tanstack/react-query'

import { telegramChannelsApi, type ChannelPurpose } from '../../apis/telegram-channels'

export const telegramChannelKeys = {
    all: ['telegram-channels'] as const,
    list: () => [...telegramChannelKeys.all, 'list'] as const,
    item: (id: number) => [...telegramChannelKeys.all, 'item', id] as const,
}

export const useTelegramChannels = (
    page = 1,
    size = 40,
    purpose: ChannelPurpose = 'parse',
    q?: string,
) =>
    useQuery({
        queryKey: [...telegramChannelKeys.list(), { page, size, purpose, q: q ?? null }],
        queryFn: () => telegramChannelsApi.getChannels(page, size, purpose, q),
    })

export const useTelegramChannel = (id: number) =>
    useQuery({
        queryKey: telegramChannelKeys.item(id),
        queryFn: () => telegramChannelsApi.getChannel(id),
        enabled: !!id,
    })
