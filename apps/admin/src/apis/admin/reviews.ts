import type { Page } from '@doska/shared'
import { requests } from './base'

// Значения синхронны с бэкендом (`apps/reviews/constants.py`).
export type AdminReviewSubjectType = 'trip' | 'listing'
export type AdminReviewStatus = 'approved' | 'hidden'

export interface AdminReviewUser {
    id: number
    full_name: string | null
    avatar_url: string | null
    avatar_thumbnail_url: string | null
    rating: number | null
}

/** Плашка «за что отзыв» — собирается бэкендом, тот же контракт, что у чатов. */
export interface AdminReviewSubject {
    type: string
    title: string
    subtitle: string | null
    icon: string
    image: string | null
    deeplink: string | null
}

export interface AdminReview {
    id: number
    author_id: number
    author: AdminReviewUser | null
    target_user_id: number | null
    target_user: AdminReviewUser | null
    subject_type: AdminReviewSubjectType | null
    subject_id: number | null
    subject: AdminReviewSubject | null
    /** Слаг сервиса: rideshare | freight | bus | real_estate | … */
    service: string | null
    rating: number
    message: string | null
    photos: string[] | null
    status: AdminReviewStatus
    data: Record<string, any> | null
    created_at: string
}

export interface AdminReviewListParams {
    q?: string
    status?: AdminReviewStatus
    service?: string
    subject_type?: AdminReviewSubjectType
    target_user_id?: number
    author_id?: number
    rating?: number
    date_from?: string
    date_to?: string
}

export const reviewsAdminApi = {
    getReviews: (page = 1, size = 40, filters?: AdminReviewListParams) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.status) params.set('status', filters.status)
        if (filters?.service) params.set('service', filters.service)
        if (filters?.subject_type) params.set('subject_type', filters.subject_type)
        if (filters?.target_user_id != null)
            params.set('target_user_id', String(filters.target_user_id))
        if (filters?.author_id != null) params.set('author_id', String(filters.author_id))
        if (filters?.rating != null) params.set('rating', String(filters.rating))
        if (filters?.date_from) params.set('date_from', filters.date_from)
        if (filters?.date_to) params.set('date_to', filters.date_to)
        return requests.get<Page<AdminReview>>(`/admin/reviews?${params.toString()}`)
    },
    // Пост-модерация: скрыть спорный отзыв или вернуть его. Рейтинг получателя
    // бэкенд пересчитывает сам.
    setReviewStatus: (id: number, status: AdminReviewStatus) =>
        requests.patch<AdminReview>(`/admin/reviews/${id}/status`, { status }),
}
