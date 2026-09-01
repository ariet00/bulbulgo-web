import type { Page } from '@doska/shared'
import { requests } from './base'

export type AdminNewsStatus = 'draft' | 'published'

// Зеркало backend/apps/bulbulgo/news/models.py (NEWS_KINDS, GUIDE_CATEGORIES).
export type AdminNewsKind = 'news' | 'guide'

export const GUIDE_CATEGORIES = [
    'start',
    'passengers',
    'drivers',
    'services',
] as const
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number]

export const GUIDE_CATEGORY_LABELS: Record<GuideCategory, string> = {
    start: 'Начало работы',
    passengers: 'Пассажирам',
    drivers: 'Водителям',
    services: 'Сервисы',
}

export interface AdminNews {
    id: number
    title: string
    kind: AdminNewsKind
    status: AdminNewsStatus
    published_at: string | null
    content: string
    cover_url: string | null
    // Только у гайдов (kind='guide').
    category: GuideCategory | null
    position: number
    // Computed by the backend: the /webview/news (or /webview/training) page
    // and the in-app deep link for push notifications.
    public_url: string
    click_action: string
    created_at: string
}

export interface AdminNewsInput {
    title: string
    content: string
    kind?: AdminNewsKind // задаётся при создании, дальше не меняется
    status: AdminNewsStatus
    cover_url?: string | null
    category?: GuideCategory | null
    position?: number
}

export const newsAdminApi = {
    // BulBul Go news + training guides (in-app markdown articles)
    getNewsList: (
        page = 1,
        size = 40,
        filters?: { q?: string; status?: string; kind?: AdminNewsKind },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.status) params.set('status', filters.status)
        if (filters?.kind) params.set('kind', filters.kind)
        return requests.get<Page<AdminNews>>(`/admin/news/?${params.toString()}`)
    },
    getNews: (id: number) => requests.get<AdminNews>(`/admin/news/${id}`),
    createNews: (body: AdminNewsInput) => requests.post<AdminNews>('/admin/news/', body),
    updateNews: (id: number, body: Partial<AdminNewsInput>) =>
        requests.put<AdminNews>(`/admin/news/${id}`, body),
    deleteNews: (id: number) => requests.delete<{ deleted: boolean }>(`/admin/news/${id}`),
}
