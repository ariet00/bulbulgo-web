import { useQuery } from '@tanstack/react-query'

import { parserApi } from '../../apis/parser'

export const parserKeys = {
    all: ['parser'] as const,
    settings: () => [...parserKeys.all, 'settings'] as const,
    setting: (id: number) => [...parserKeys.settings(), id] as const,
    channels: () => [...parserKeys.all, 'channels'] as const,
    channel: (id: number) => [...parserKeys.channels(), id] as const,
}

export const useParserSettings = (
    page = 1,
    size = 40,
    group?: string,
    q?: string,
) =>
    useQuery({
        queryKey: [
            ...parserKeys.settings(),
            { page, size, group: group ?? null, q: q ?? null },
        ],
        queryFn: () => parserApi.getSettings(page, size, group, q),
    })

export const useParserSetting = (id: number) =>
    useQuery({
        queryKey: parserKeys.setting(id),
        queryFn: () => parserApi.getSetting(id),
        enabled: !!id,
    })

export const useParserChannels = (
    page = 1,
    size = 40,
    purpose: 'parse' | 'publish' = 'parse',
    q?: string,
) =>
    useQuery({
        queryKey: [
            ...parserKeys.channels(),
            { page, size, purpose, q: q ?? null },
        ],
        queryFn: () => parserApi.getChannels(page, size, purpose, q),
    })

export const useParserChannel = (id: number) =>
    useQuery({
        queryKey: parserKeys.channel(id),
        queryFn: () => parserApi.getChannel(id),
        enabled: !!id,
    })
