import { AxiosResponse } from 'axios'

import { requester } from '../lib/requester'

import type { Page } from '../types'

// Универсальная таблица настроек (бэкенд: shared/models/settings.py,
// ручки — apps/app_settings/admin/registry.py на /admin/common/settings).
// Здесь лежат настройки любого домена: строка адресуется парой (group, key)
// плюс необязательная область (domain / company_id / user_id).

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const requests = {
    get: <T>(url: string) => requester.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => requester.post<T>(url, body).then(responseBody),
    patch: <T>(url: string, body: {}) => requester.patch<T>(url, body).then(responseBody),
    delete: <T>(url: string) => requester.delete<T>(url).then(responseBody),
}

export interface SettingRow {
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

export interface SettingRowCreate {
    group: string
    key: string
    data: any
    user_id?: number | null
    company_id?: number | null
    domain?: string | null
    description?: string | null
}

export interface SettingRowUpdate {
    group?: string
    key?: string
    data?: any
    user_id?: number | null
    company_id?: number | null
    domain?: string | null
    description?: string | null
}

const BASE = '/admin/common/settings'

export const settingsRegistryApi = {
    getSettings: (page = 1, size = 40, group?: string, q?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (group) params.set('group', group)
        if (q) params.set('q', q)
        return requests.get<Page<SettingRow>>(`${BASE}/?${params.toString()}`)
    },
    getSetting: (id: number) => requests.get<SettingRow>(`${BASE}/${id}`),
    createSetting: (body: SettingRowCreate) => requests.post<SettingRow>(`${BASE}/`, body),
    updateSetting: (id: number, body: SettingRowUpdate) =>
        requests.patch<SettingRow>(`${BASE}/${id}`, body),
    deleteSetting: (id: number) => requests.delete<{ message: string }>(`${BASE}/${id}`),
}
