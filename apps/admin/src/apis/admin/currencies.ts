import { requests } from './base'

// Справочник валют публичный (сидируется из fixtures) — админка читает те же
// эндпоинты, отдельного /admin-слайса на бэкенде нет.

export interface AdminCurrency {
    id: number
    code: string
    symbol: string
    name: string
}

// {code: сколько KGS за 1 единицу} — обновляется Celery-таской из НБКР.
export type AdminCurrencyRates = Record<string, number>

export const currenciesAdminApi = {
    getCurrencies: () => requests.get<AdminCurrency[]>('/currencies/'),
    getCurrencyRates: () => requests.get<AdminCurrencyRates>('/currencies/rates'),
}
