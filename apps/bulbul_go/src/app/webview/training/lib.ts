// Категории гайдов «Обучения» — зеркало GUIDE_CATEGORIES в
// backend/apps/bulbulgo/news/models.py (контент и UI сервиса — ru, как news).

export const GUIDE_CATEGORIES = [
    { id: 'start', label: 'Начало работы' },
    { id: 'passengers', label: 'Пассажирам' },
    { id: 'drivers', label: 'Водителям' },
    { id: 'services', label: 'Сервисы' },
] as const

export type GuideCategoryId = (typeof GUIDE_CATEGORIES)[number]['id']

export function guideCategoryLabel(id: string | null): string {
    return GUIDE_CATEGORIES.find((c) => c.id === id)?.label ?? ''
}
