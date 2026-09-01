import type { Page } from '@doska/shared'
import { requests } from './base'

export const miscAdminApi = {
    // Vehicles
    getVehicles: (
        page = 1,
        size = 40,
        q?: string,
        filters?: {
            vehicle_type?: string
            year?: number
            user_id?: number
        },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (filters?.vehicle_type) params.set('vehicle_type', filters.vehicle_type)
        if (filters?.year) params.set('year', String(filters.year))
        if (filters?.user_id) params.set('user_id', String(filters.user_id))
        return requests.get<Page<any>>(`/admin/vehicles/?${params.toString()}`)
    },
    getVehicle: (id: number) => requests.get<any>(`/admin/vehicles/${id}`),
    deleteVehicle: (id: number) => requests.delete<any>(`/admin/vehicles/${id}`),

    // Properties
    getProperties: (page = 1, size = 40) =>
        requests.get<Page<any>>(`/admin/properties/?page=${page}&size=${size}`),
    getProperty: (id: number) => requests.get<any>(`/admin/properties/${id}`),
    createProperty: (data: any) => requests.post<any>('/admin/properties/', data),
    updateProperty: (id: number, data: any) => requests.put<any>(`/admin/properties/${id}`, data),
    deleteProperty: (id: number) => requests.delete<any>(`/admin/properties/${id}`),

    // Chats
    getChats: (page = 1, size = 40, q?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        return requests.get<Page<any>>(`/admin/chats/?${params.toString()}`)
    },
    getChat: (id: number) => requests.get<any>(`/admin/chats/${id}`),
    // Support inbox: chats with the «Техподдержка» account, newest first.
    getSupportChats: (page = 1, size = 40) =>
        requests.get<Page<any>>(
            `/admin/chats/support?page=${page}&size=${size}`,
        ),
    // Reply in a support chat as the «Техподдержка» account. `parentId` quotes
    // a specific message (rendered as a reply preview client-side).
    replyToChat: (id: number, content: string, parentId?: number) =>
        requests.post<any>(`/admin/chats/${id}/reply`, {
            content,
            parent_id: parentId,
        }),
    // Get-or-create the support chat with a user — lets support write first.
    openSupportChat: (userId: number) =>
        requests.post<any>(`/admin/chats/support/${userId}`, {}),
}
