import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ModerationConfig, adminApi } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminUpdateModerationSettings = (botId?: number) => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (config: ModerationConfig) =>
            adminApi.updateModerationSettings(config, botId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.moderationSettings(botId) })
            toast.success('Настройки модерации сохранены')
        },
    })
}

export const useAdminUpdateModeratedChat = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, enabled }: { id: number; enabled: boolean | null }) =>
            adminApi.updateModeratedChat(id, { enabled }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.moderationChats() })
            toast.success('Настройка группы сохранена')
        },
    })
}
