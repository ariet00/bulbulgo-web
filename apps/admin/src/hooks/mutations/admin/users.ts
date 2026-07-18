import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminUserAppNotice } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminBanUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            adminApi.banUser(id, isActive),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users() })
            queryClient.invalidateQueries({ queryKey: adminKeys.user(id) })
            toast.success('User status updated')
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

// === Complaints (user reports) ===
