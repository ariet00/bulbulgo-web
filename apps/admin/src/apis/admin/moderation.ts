import { requests } from './base'

// Модерация Telegram-групп (бэкенд: apps/telegram/moderation).
// Наборы правил и действий заданы на бэкенде в
// apps/telegram/moderation/constants.py — значения держим в паре с ним.

export const MODERATION_RULES = ['stop_words', 'links'] as const
export type ModerationRule = (typeof MODERATION_RULES)[number]
export const MODERATION_RULE_LABELS: Record<ModerationRule, string> = {
    stop_words: 'Стоп-слова',
    links: 'Ссылки',
}

export const MODERATION_ACTIONS = ['delete', 'warn', 'mute', 'ban', 'report'] as const
export type ModerationAction = (typeof MODERATION_ACTIONS)[number]
export const MODERATION_ACTION_LABELS: Record<ModerationAction, string> = {
    delete: 'Удалить сообщение',
    warn: 'Предупредить',
    mute: 'Замьютить',
    ban: 'Забанить',
    report: 'Сообщить модератору',
}
// Что бот умеет исполнять сейчас (IMPLEMENTED_ACTIONS на бэкенде).
export const IMPLEMENTED_MODERATION_ACTIONS: ModerationAction[] = ['delete']

// Минимальная длина стоп-слова — MIN_WORD_LENGTH в
// apps/telegram/moderation/constants.py. Проверяем и здесь, чтобы вместо
// сырой 422-ошибки показать понятную подсказку у поля.
export const MIN_STOP_WORD_LENGTH = 3

export interface ModerationStopWordsRule {
    enabled: boolean
    action: ModerationAction
    words: string[]
}

export interface ModerationLinksRule {
    enabled: boolean
    action: ModerationAction
    /** домены-исключения; поддомены разрешаются вместе с доменом */
    allow_domains: string[]
    /** разрешить ссылки на Telegram (t.me и родственные хосты) */
    allow_telegram: boolean
}

export interface ModerationConfig {
    enabled: boolean
    check_edited: boolean
    exempt: { admins: boolean }
    rules: {
        stop_words: ModerationStopWordsRule
        links: ModerationLinksRule
    }
}

export interface ModerationSettings {
    bot_id: number
    bot_slug: string
    bot_name: string | null
    config: ModerationConfig
}

export interface ModerationBot {
    id: number
    slug: string
    name: string | null
    username: string | null
    is_active: boolean
}

export interface ModeratedChat {
    id: number
    chat_id: string
    title: string | null
    is_active: boolean
    /** оверрайд группы: null — наследует настройку бота */
    enabled: boolean | null
    created_at: string
}

export interface ModerationLog {
    id: number
    created_at: string
    rule: ModerationRule | null
    action: ModerationAction | null
    chat_id: string | null
    chat_title: string | null
    tg_user_id: number | null
    username: string | null
    full_name: string | null
    matched: string | null
    text: string | null
    is_edited: boolean | null
    executed: boolean | null
    error: string | null
}

export interface ModerationPage<T> {
    items: T[]
    total: number
    page: number
    size: number
}

export interface ModerationLogFilters {
    chat_id?: string
    rule?: string
    action?: string
    from?: string
    to?: string
}

const withBot = (params: URLSearchParams, botId?: number) => {
    if (botId !== undefined) params.set('bot_id', String(botId))
    return params
}

export const moderationAdminApi = {
    getModerationBots: () => requests.get<ModerationBot[]>('/admin/telegram/moderation/bots'),

    getModerationSettings: (botId?: number) =>
        requests.get<ModerationSettings>(
            `/admin/telegram/moderation/settings?${withBot(new URLSearchParams(), botId)}`,
        ),

    updateModerationSettings: (config: ModerationConfig, botId?: number) =>
        requests.put<ModerationSettings>(
            `/admin/telegram/moderation/settings?${withBot(new URLSearchParams(), botId)}`,
            config,
        ),

    getModeratedChats: (page = 1, size = 50, botId?: number, onlyActive = false) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (onlyActive) params.set('only_active', 'true')
        return requests.get<ModerationPage<ModeratedChat>>(
            `/admin/telegram/moderation/chats?${withBot(params, botId)}`,
        )
    },

    updateModeratedChat: (id: number, body: { enabled: boolean | null }) =>
        requests.patch<ModeratedChat>(`/admin/telegram/moderation/chats/${id}`, body),

    getModerationLogs: (
        page = 1,
        size = 50,
        filters?: ModerationLogFilters,
        botId?: number,
    ) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        for (const [k, v] of Object.entries(filters ?? {})) {
            if (v !== undefined && v !== '') params.set(k, String(v))
        }
        return requests.get<ModerationPage<ModerationLog>>(
            `/admin/telegram/moderation/logs?${withBot(params, botId)}`,
        )
    },
}
