import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
    parserApi,
    type ParserChannelCreate,
    type ParserChannelUpdate,
    type ParserSettingCreate,
    type ParserSettingUpdate,
} from '../../apis/parser'
import { parserKeys } from '../queries/parser'

// ----- Settings -----

export const useCreateParserSetting = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: ParserSettingCreate) => parserApi.createSetting(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: parserKeys.settings() })
            toast.success('Настройка создана')
        },
        onError: () => toast.error('Не удалось создать настройку'),
    })
}

export const useUpdateParserSetting = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: ParserSettingUpdate }) =>
            parserApi.updateSetting(id, body),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: parserKeys.settings() })
            qc.invalidateQueries({ queryKey: parserKeys.setting(id) })
            toast.success('Настройка обновлена')
        },
        onError: () => toast.error('Не удалось обновить настройку'),
    })
}

export const useDeleteParserSetting = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => parserApi.deleteSetting(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: parserKeys.settings() })
            toast.success('Настройка удалена')
        },
        onError: () => toast.error('Не удалось удалить настройку'),
    })
}

// ----- Channels -----

export const useCreateParserChannel = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: ParserChannelCreate) => parserApi.createChannel(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: parserKeys.channels() })
            toast.success('Канал создан')
        },
        onError: () => toast.error('Не удалось создать канал'),
    })
}

export const useUpdateParserChannel = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: ParserChannelUpdate }) =>
            parserApi.updateChannel(id, body),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: parserKeys.channels() })
            qc.invalidateQueries({ queryKey: parserKeys.channel(id) })
            toast.success('Канал обновлён')
        },
        onError: () => toast.error('Не удалось обновить канал'),
    })
}

export const useDeleteParserChannel = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => parserApi.deleteChannel(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: parserKeys.channels() })
            toast.success('Канал удалён')
        },
        onError: () => toast.error('Не удалось удалить канал'),
    })
}
