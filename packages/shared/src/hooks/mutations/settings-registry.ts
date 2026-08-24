import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
    settingsRegistryApi,
    type SettingRowCreate,
    type SettingRowUpdate,
} from '../../apis/settings-registry'
import { settingsRegistryKeys } from '../queries/settings-registry'

export const useCreateSetting = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: SettingRowCreate) => settingsRegistryApi.createSetting(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsRegistryKeys.all })
            toast.success('Настройка создана')
        },
        onError: () => toast.error('Не удалось создать настройку'),
    })
}

export const useUpdateSetting = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: SettingRowUpdate }) =>
            settingsRegistryApi.updateSetting(id, body),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: settingsRegistryKeys.list() })
            qc.invalidateQueries({ queryKey: settingsRegistryKeys.item(id) })
            toast.success('Настройка обновлена')
        },
        onError: () => toast.error('Не удалось обновить настройку'),
    })
}

export const useDeleteSetting = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => settingsRegistryApi.deleteSetting(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsRegistryKeys.all })
            toast.success('Настройка удалена')
        },
        onError: () => toast.error('Не удалось удалить настройку'),
    })
}
