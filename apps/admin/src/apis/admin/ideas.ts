import type { Page } from '@doska/shared'
import { requests } from './base'

// Зеркало backend/apps/ideas/models.py (IDEA_STATUSES, IDEA_CATEGORIES).
export const IDEA_STATUSES = ['new', 'planned', 'done', 'declined'] as const
export type IdeaStatus = (typeof IDEA_STATUSES)[number]

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
    new: 'На рассмотрении',
    planned: 'Запланировано',
    done: 'Сделано',
    declined: 'Отклонено',
}

export const IDEA_CATEGORY_LABELS: Record<string, string> = {
    suggestion: 'Предложение',
    problem: 'Проблема',
    other: 'Другое',
}

export interface AdminIdea {
    id: number
    user_id: number
    author_name: string | null
    author_phone: string | null
    text: string
    category: string | null
    status: IdeaStatus
    photos: string[]
    created_at: string
}

export const ideasAdminApi = {
    // User ideas/suggestions (webview form «Идеи и предложения»)
    getIdeasList: (
        page = 1,
        size = 40,
        filters?: { q?: string; status?: string },
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.status) params.set('status', filters.status)
        return requests.get<Page<AdminIdea>>(`/admin/ideas/?${params.toString()}`)
    },
    updateIdeaStatus: (id: number, status: IdeaStatus) =>
        requests.put<AdminIdea>(`/admin/ideas/${id}/status`, { status }),
    deleteIdea: (id: number) =>
        requests.delete<{ deleted: boolean }>(`/admin/ideas/${id}`),
}
