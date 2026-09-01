import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminVehicles = (
    page: number = 1,
    size: number = 40,
    q?: string,
    filters?: {
        vehicle_type?: string
        year?: number
        user_id?: number
    },
) => {
    return useQuery({
        queryKey: [
            ...adminKeys.vehicles(),
            {
                page,
                size,
                q: q ?? null,
                vehicle_type: filters?.vehicle_type ?? null,
                year: filters?.year ?? null,
                user_id: filters?.user_id ?? null,
            },
        ],
        queryFn: () => adminApi.getVehicles(page, size, q, filters),
    })
}

export const useAdminVehicle = (id: number) => {
    return useQuery({
        queryKey: adminKeys.vehicle(id),
        queryFn: () => adminApi.getVehicle(id),
        enabled: !!id,
    })
}

export const useAdminProperties = (page: number = 1, size: number = 40) => {
    return useQuery({
        queryKey: [...adminKeys.properties(), { page, size }],
        queryFn: () => adminApi.getProperties(page, size),
    })
}

export const useAdminProperty = (id: number) => {
    return useQuery({
        queryKey: adminKeys.property(id),
        queryFn: () => adminApi.getProperty(id),
        enabled: !!id,
    })
}

export const useAdminChats = (
    page: number = 1,
    size: number = 40,
    q?: string,
) => {
    return useQuery({
        queryKey: [...adminKeys.chats(), { page, size, q: q ?? null }],
        queryFn: () => adminApi.getChats(page, size, q),
    })
}

export const useAdminChat = (id: number) => {
    return useQuery({
        queryKey: adminKeys.chat(id),
        queryFn: () => adminApi.getChat(id),
        enabled: !!id,
    })
}

export const useAdminSupportChats = (page: number = 1, size: number = 40) => {
    return useQuery({
        queryKey: [...adminKeys.supportChats(), { page, size }],
        queryFn: () => adminApi.getSupportChats(page, size),
    })
}

// Reply in a support chat as «Техподдержка». The endpoint returns the created
// message, so append it to the open thread immediately (no refetch flicker —
// the message shows the instant the request resolves). Deduped by id since the
// realtime WS echo may also deliver it. The inbox list is refreshed for the
// updated preview/ordering.
export const useReplyToChat = (id: number) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ content, parentId }: { content: string; parentId?: number }) =>
            adminApi.replyToChat(id, content, parentId),
        onSuccess: (message: any) => {
            queryClient.setQueryData(adminKeys.chat(id), (prev: any) => {
                if (!prev || !message?.id) return prev
                const messages = prev.messages ?? []
                if (messages.some((m: any) => m.id === message.id)) return prev
                return {
                    ...prev,
                    messages: [...messages, message],
                    last_message: message,
                    last_message_at: message.created_at,
                }
            })
            queryClient.invalidateQueries({ queryKey: adminKeys.supportChats() })
        },
    })
}

// Get-or-create the support chat with a user (e.g. from the user detail page,
// «Написать в поддержку») — seeds the query cache so opening /admin/support
// with the returned chat id doesn't need a refetch.
export const useOpenSupportChat = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (userId: number) => adminApi.openSupportChat(userId),
        onSuccess: (chat: any) => {
            if (chat?.id) queryClient.setQueryData(adminKeys.chat(chat.id), chat)
        },
    })
}
