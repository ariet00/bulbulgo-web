import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminBalanceAdjustBody, AdminUserAppNotice, LoginMethod } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminBanUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            status,
            cascade,
        }: {
            id: number
            status: 'active' | 'banned'
            cascade?: boolean
        }) => adminApi.banUser(id, status, cascade),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users() })
            queryClient.invalidateQueries({ queryKey: adminKeys.user(id) })
            toast.success('User status updated')
        },
    })
}

export const useAdminBanDevice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: 'active' | 'banned' }) =>
            adminApi.banDevice(id, status),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.devices() })
            queryClient.invalidateQueries({ queryKey: adminKeys.device(id) })
            toast.success('Статус устройства обновлён')
        },
    })
}

export const useSetDeviceLoginMethods = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, disabled }: { id: number; disabled: LoginMethod[] }) =>
            adminApi.setDeviceLoginMethods(id, disabled),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.device(id) })
            toast.success('Способы входа обновлены')
        },
    })
}

export const useAdminBanIdentifier = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: { type: string; value: string; reason?: string }) =>
            adminApi.banIdentifier(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users() })
            toast.success('Идентификатор забанен')
        },
        onError: (e: any) => {
            toast.error(e?.response?.data?.detail ?? 'Не удалось забанить')
        },
    })
}

export const useAdminUnbanIdentifier = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.unbanIdentifier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users() })
            toast.success('Идентификатор разбанен')
        },
    })
}

export const useUpdateAdminUserFeatures = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            overrides,
        }: {
            id: number
            overrides: Record<string, boolean | null>
        }) => adminApi.updateUserFeatures(id, overrides),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({
                queryKey: [...adminKeys.user(id), 'features'],
            })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminUserPreBlockWarning = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({
            id,
            enabled,
            message,
            rules_url,
        }: {
            id: number
            enabled: boolean
            message: string | null
            rules_url: string | null
        }) =>
            adminApi.updateUserPreBlockWarning(id, {
                enabled,
                message,
                rules_url,
            }),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({
                queryKey: [...adminKeys.user(id), 'pre-block-warning'],
            })
            queryClient.invalidateQueries({ queryKey: adminKeys.user(id) })
            toast.success('Сохранено')
        },
    })
}

export const useUpdateAdminUserAppNotice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminUserAppNotice }) =>
            adminApi.updateUserAppNotice(id, body),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({
                queryKey: [...adminKeys.user(id), 'app-notice'],
            })
            queryClient.invalidateQueries({ queryKey: adminKeys.user(id) })
            toast.success('Сохранено')
        },
    })
}

export const useAdminAdjustUserBalance = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminBalanceAdjustBody }) =>
            adminApi.adjustUserBalance(id, body),
        onSuccess: (res, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.user(id) })
            const verb = res.type === 'income' ? 'Начислено' : 'Списано'
            toast.success(
                `${verb} ${res.amount} ${res.currency} · ${res.wallet_name}` +
                    (res.notified ? ' · уведомление отправлено' : ''),
            )
        },
        onError: (e: any) => {
            toast.error(
                e?.response?.data?.message ??
                    e?.response?.data?.detail ??
                    'Не удалось изменить баланс',
            )
        },
    })
}

// === Complaints (user reports) ===
