import { AxiosResponse } from 'axios'

import { requester } from '../lib/requester'

import type { Page } from '../types'
import type { TripRole } from '../types/trip'

// Чаты Telegram (бэкенд: telegram.chats, ручки — apps/telegram/channels/admin).
// Одна таблица держит источники парсера, цели публикации и группы, которые
// модерирует бот; роль различается полем channel_type.

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const requests = {
    get: <T>(url: string) => requester.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => requester.post<T>(url, body).then(responseBody),
    patch: <T>(url: string, body: {}) => requester.patch<T>(url, body).then(responseBody),
    delete: <T>(url: string) => requester.delete<T>(url).then(responseBody),
}

export interface ChannelParserBlock {
    use_parser_ai: boolean
    ai_fallback: boolean
    limit_message: number
    skip_keywords: string[]
    /** Trip roles to keep when parsing this channel. Empty = keep all. */
    allowed_roles: TripRole[]
    sort_order: number
    bot_username: string
    /**
     * Per-channel content filters (free-form JSON, extensible). Currently:
     * `{ price: { <role>: { enabled: boolean; min: number|null; max: number|null } } }`.
     * null / absent = no filtering.
     */
    filters?: Record<string, any> | null
}

/** Роли чата — зеркало `CHANNEL_TYPES` в backend `apps/telegram/models/chat.py`.
 * Единственный источник для селектов, бейджей и фильтров в UI. */
export const CHANNEL_TYPES = ['parse', 'publish', 'both', 'none', 'moderate'] as const

export type ChannelType = (typeof CHANNEL_TYPES)[number]

export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
    parse: 'Парсинг',
    publish: 'Публикация',
    both: 'И парсинг и публикация',
    none: 'Не используется',
    moderate: 'Модерация',
}

/** Значения фильтра списка (`purpose`); `all` — без фильтра по channel_type. */
export const CHANNEL_PURPOSES = ['parse', 'publish', 'moderate', 'all'] as const

export type ChannelPurpose = (typeof CHANNEL_PURPOSES)[number]

export const CHANNEL_PURPOSE_LABELS: Record<ChannelPurpose, string> = {
    parse: 'Парсинг',
    publish: 'Публикация',
    moderate: 'Модерация',
    all: 'Все',
}

export interface TelegramChannel {
    id: number
    chat_id: string
    title: string | null
    bot_id: number | null
    is_active: boolean
    channel_type: ChannelType
    parser: ChannelParserBlock
    created_at: string
}

export interface TelegramChannelCreate {
    chat_id: string
    title?: string | null
    bot_id?: number | null
    is_active?: boolean
    channel_type?: ChannelType
    parser?: Partial<ChannelParserBlock>
}

export interface TelegramChannelUpdate {
    chat_id?: string
    title?: string | null
    bot_id?: number | null
    is_active?: boolean
    channel_type?: ChannelType
    parser?: Partial<ChannelParserBlock>
}

const BASE = '/admin/telegram/channels'

export const telegramChannelsApi = {
    getChannels: (page = 1, size = 40, purpose: ChannelPurpose = 'parse', q?: string) => {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
            purpose,
        })
        if (q) params.set('q', q)
        return requests.get<Page<TelegramChannel>>(`${BASE}/?${params.toString()}`)
    },
    getChannel: (id: number) => requests.get<TelegramChannel>(`${BASE}/${id}`),
    createChannel: (body: TelegramChannelCreate) =>
        requests.post<TelegramChannel>(`${BASE}/`, body),
    updateChannel: (id: number, body: TelegramChannelUpdate) =>
        requests.patch<TelegramChannel>(`${BASE}/${id}`, body),
    deleteChannel: (id: number) => requests.delete<{ message: string }>(`${BASE}/${id}`),
}
