import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ModerationLogFilters, adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminModerationBots = () =>
    useQuery({
        queryKey: adminKeys.moderationBots(),
        queryFn: () => adminApi.getModerationBots(),
    })

export const useAdminModerationSettings = (botId?: number) =>
    useQuery({
        queryKey: adminKeys.moderationSettings(botId),
        queryFn: () => adminApi.getModerationSettings(botId),
    })

export const useAdminModeratedChats = (
    page = 1,
    size = 50,
    botId?: number,
    onlyActive = false,
) =>
    useQuery({
        queryKey: [...adminKeys.moderationChats(), { page, size, botId, onlyActive }],
        queryFn: () => adminApi.getModeratedChats(page, size, botId, onlyActive),
        placeholderData: keepPreviousData,
    })

export const useAdminModerationLogs = (
    page = 1,
    size = 50,
    filters?: ModerationLogFilters,
    botId?: number,
) =>
    useQuery({
        queryKey: [...adminKeys.moderationLogs(), { page, size, botId, ...(filters ?? {}) }],
        queryFn: () => adminApi.getModerationLogs(page, size, filters, botId),
        placeholderData: keepPreviousData,
    })
