import { requests } from './base'

// Каталог типов Telegram-ботов (бэкенд: apps/telegram/bot_types.py).
// Форма бота в админке рисуется по этому ответу: список типов, набор полей и
// ссылка на отдельную страницу настроек, если они у типа свои.

/** Необязательные поля формы бота — значения FIELD_* каталога. */
export const BOT_FIELD_MINI_APP_URL = 'mini_app_url'
export const BOT_FIELD_COMPANY = 'company'

export interface BotTypeSpec {
    value: string
    label: string
    description: string
    fields: string[]
    settings_href: string | null
    receives_updates: boolean
}

export const telegramAdminApi = {
    getBotTypes: () => requests.get<BotTypeSpec[]>('/admin/telegram/bot-types'),
}
