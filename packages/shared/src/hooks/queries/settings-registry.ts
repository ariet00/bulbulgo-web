import { useQuery } from '@tanstack/react-query'

import { settingsRegistryApi } from '../../apis/settings-registry'

export const settingsRegistryKeys = {
    all: ['settings-registry'] as const,
    list: () => [...settingsRegistryKeys.all, 'list'] as const,
    item: (id: number) => [...settingsRegistryKeys.all, 'item', id] as const,
}

export const useSettingsRegistry = (page = 1, size = 40, group?: string, q?: string) =>
    useQuery({
        queryKey: [
            ...settingsRegistryKeys.list(),
            { page, size, group: group ?? null, q: q ?? null },
        ],
        queryFn: () => settingsRegistryApi.getSettings(page, size, group, q),
    })

export const useSettingsRegistryItem = (id: number) =>
    useQuery({
        queryKey: settingsRegistryKeys.item(id),
        queryFn: () => settingsRegistryApi.getSetting(id),
        enabled: !!id,
    })
