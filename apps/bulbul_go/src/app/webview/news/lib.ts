const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface NewsListItem {
    id: number
    title: string
    cover_url: string | null
    published_at: string | null
    // Только у гайдов (kind='guide') — слаг категории (GUIDE_CATEGORIES).
    category: string | null
}

export interface NewsArticle extends NewsListItem {
    content: string
}

// Один эндпоинт на оба вида: 'news' — лента новостей, 'guide' — гайды
// сервиса «Обучение» (/webview/training).
export async function fetchNewsList(
    kind: 'news' | 'guide' = 'news',
): Promise<NewsListItem[]> {
    const r = await fetch(`${API_URL}/bulbulgo/news/?limit=50&kind=${kind}`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return (await r.json()) as NewsListItem[]
}

// Новости больше нет (удалили/сняли с публикации). Отдельный тип: ретрай тут
// бессмыслен — 404 не станет 200. Ловится по пуш-диплинку на старую статью.
export class NewsNotFound extends Error {}

export async function fetchNews(id: string): Promise<NewsArticle> {
    const r = await fetch(`${API_URL}/bulbulgo/news/${id}`)
    if (r.status === 404) throw new NewsNotFound(`news ${id} not found`)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return (await r.json()) as NewsArticle
}

const MONTHS_RU = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

export function formatNewsDate(iso: string | null): string {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`
}
