import type { AdminBroadcastFilters } from '@/apis/admin'

// Шаблоны уведомлений хранятся в localStorage и общие для всех экранов
// отправки (страница рассылок + вкладка «Уведомление» в карточке пользователя),
// поэтому один похожий текст можно переиспользовать где угодно.
export const TEMPLATE_STORAGE_KEY = 'admin:notification-templates:v1'

export type NotificationTemplate = {
    name: string
    tab: 'user' | 'broadcast'
    title: string
    body: string
    type: string
    category: string
    clickAction: string
    dataJson: string
    isDataOnly: boolean
    filters: AdminBroadcastFilters
}

export function loadTemplates(): NotificationTemplate[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export function saveTemplates(templates: NotificationTemplate[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates))
}
