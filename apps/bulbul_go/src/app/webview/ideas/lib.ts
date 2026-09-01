// API и словари сервиса «Идеи и предложения».
// Категории/статусы — зеркало backend/apps/ideas/models.py
// (IDEA_CATEGORIES, IDEA_STATUSES).

import { authFetch } from '../auth'

export const IDEA_CATEGORIES = [
    { id: 'suggestion', label: 'Предложение' },
    { id: 'problem', label: 'Проблема' },
    { id: 'other', label: 'Другое' },
] as const

export type IdeaCategoryId = (typeof IDEA_CATEGORIES)[number]['id']

export type IdeaStatus = 'new' | 'planned' | 'done' | 'declined'

export const IDEA_STATUS_LABELS: Record<IdeaStatus, string> = {
    new: 'На рассмотрении',
    planned: 'Запланировано',
    done: 'Сделано',
    declined: 'Отклонено',
}

export interface MyIdea {
    id: number
    text: string
    category: string | null
    status: IdeaStatus
    photos: string[]
    created_at: string
}

async function ok<T>(r: Response): Promise<T> {
    if (!r.ok) {
        // CoreException сериализуется в {success, message, code} — показываем
        // message пользователю (например, дневной лимит идей).
        let message = `HTTP ${r.status}`
        try {
            const body = (await r.json()) as { message?: string }
            if (body.message) message = body.message
        } catch {
            // не-JSON ответ — остаётся HTTP-код
        }
        throw new Error(message)
    }
    return (await r.json()) as T
}

export async function createIdea(body: {
    text: string
    category: IdeaCategoryId
    photos: string[]
}): Promise<MyIdea> {
    return ok(
        await authFetch('/ideas/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }),
    )
}

export async function fetchMyIdeas(): Promise<MyIdea[]> {
    return ok(await authFetch('/ideas/my'))
}

/** Загрузить скриншот в публичное хранилище, вернуть URL. */
export async function uploadIdeaPhoto(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const { url } = await ok<{ url: string }>(
        await authFetch('/upload/?storage_type=cloudflare&is_public=true', {
            method: 'POST',
            body: form,
        }),
    )
    return url
}
