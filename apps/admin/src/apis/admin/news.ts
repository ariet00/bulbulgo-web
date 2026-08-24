import type { Page } from '@doska/shared'
import { requests } from './base'

export type AdminNewsStatus = 'draft' | 'published'

export interface AdminNews {
    id: number
    title: string
    status: AdminNewsStatus
    published_at: string | null
    content: string
    cover_url: string | null
    // Computed by the backend: the /webview/news page and the in-app deep
    // link for push notifications.
    public_url: string
    click_action: string
    created_at: string
}

export interface AdminNewsInput {
    title: string
    content: string
    status: AdminNewsStatus
    cover_url?: string | null
}

export const newsAdminApi = {
    // BulBul Go news (in-app articles opened from pushes / home card)
    getNewsList: (page = 1, size = 40, filters?: { q?: string; status?: string }) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.status) params.set('status', filters.status)
        return requests.get<Page<AdminNews>>(`/admin/news/?${params.toString()}`)
    },
    getNews: (id: number) => requests.get<AdminNews>(`/admin/news/${id}`),
    createNews: (body: AdminNewsInput) => requests.post<AdminNews>('/admin/news/', body),
    updateNews: (id: number, body: Partial<AdminNewsInput>) =>
        requests.put<AdminNews>(`/admin/news/${id}`, body),
    deleteNews: (id: number) => requests.delete<{ deleted: boolean }>(`/admin/news/${id}`),
}
