import { AxiosResponse } from 'axios'

import { requester } from '../lib/requester'

import type { Page } from './admin'

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const requests = {
    get: <T>(url: string) => requester.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => requester.post<T>(url, body).then(responseBody),
    patch: <T>(url: string, body: {}) => requester.patch<T>(url, body).then(responseBody),
    delete: <T>(url: string) => requester.delete<T>(url).then(responseBody),
}

// ---------- Settings (universal KV) ----------

export interface ParserSetting {
    id: number
    group: string
    key: string
    data: any
    user_id: number | null
    company_id: number | null
    domain: string | null
    description: string | null
    created_at: string
    updated_at: string | null
}

export interface ParserSettingCreate {
    group: string
    key: string
    data: any
    user_id?: number | null
    company_id?: number | null
    domain?: string | null
    description?: string | null
}

export interface ParserSettingUpdate {
    group?: string
    key?: string
    data?: any
    user_id?: number | null
    company_id?: number | null
    domain?: string | null
    description?: string | null
}

// ---------- Channels (telegram.chats) ----------

import type { TripRole } from '../types/trip'

export interface ParserChannelBlock {
    use_parser_ai: boolean
    ai_fallback: boolean
    limit_message: number
    skip_keywords: string[]
    sort_order: number
    bot_username: string
    /** Trip roles to keep when parsing this channel. Empty = keep all. */
    allowed_roles: TripRole[]
    /** Per-channel trip lifetime in hours. null = use the global parser setting. */
    trip_expire_hours: number | null
}

export type ChannelType = 'parse' | 'publish' | 'both' | 'none'

export interface ParserChannel {
    id: number
    chat_id: string
    bot_id: number | null
    is_active: boolean
    channel_type: ChannelType
    parser: ParserChannelBlock
    created_at: string
}

export interface ParserChannelCreate {
    chat_id: string
    bot_id?: number | null
    is_active?: boolean
    channel_type?: ChannelType
    parser?: Partial<ParserChannelBlock>
}

export interface ParserChannelUpdate {
    chat_id?: string
    bot_id?: number | null
    is_active?: boolean
    channel_type?: ChannelType
    parser?: Partial<ParserChannelBlock>
}

// ---------- API ----------

export const parserApi = {
    // Settings
    getSettings: (page = 1, size = 40, group?: string, q?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (group) params.set('group', group)
        if (q) params.set('q', q)
        return requests.get<Page<ParserSetting>>(`/admin/parser/settings/?${params.toString()}`)
    },
    getSetting: (id: number) => requests.get<ParserSetting>(`/admin/parser/settings/${id}`),
    createSetting: (body: ParserSettingCreate) =>
        requests.post<ParserSetting>('/admin/parser/settings/', body),
    updateSetting: (id: number, body: ParserSettingUpdate) =>
        requests.patch<ParserSetting>(`/admin/parser/settings/${id}`, body),
    deleteSetting: (id: number) =>
        requests.delete<{ message: string }>(`/admin/parser/settings/${id}`),

    // Channels
    getChannels: (
        page = 1,
        size = 40,
        purpose: 'parse' | 'publish' = 'parse',
        q?: string,
    ) => {
        const params = new URLSearchParams({
            page: String(page),
            size: String(size),
            purpose,
        })
        if (q) params.set('q', q)
        return requests.get<Page<ParserChannel>>(`/admin/parser/channels/?${params.toString()}`)
    },
    getChannel: (id: number) => requests.get<ParserChannel>(`/admin/parser/channels/${id}`),
    createChannel: (body: ParserChannelCreate) =>
        requests.post<ParserChannel>('/admin/parser/channels/', body),
    updateChannel: (id: number, body: ParserChannelUpdate) =>
        requests.patch<ParserChannel>(`/admin/parser/channels/${id}`, body),
    deleteChannel: (id: number) =>
        requests.delete<{ message: string }>(`/admin/parser/channels/${id}`),
}
