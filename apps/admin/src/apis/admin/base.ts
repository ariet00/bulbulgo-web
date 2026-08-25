import { requester } from '@doska/shared'
import { AxiosResponse } from 'axios'

// Ось «с какого клиента пришло действие» (analytics_events.client): без
// заголовка события админки падали в product=unknown. requester общий по
// коду, но инстанс — свой на каждый Next-бандл, другие приложения не заденет.
requester.defaults.headers.common['X-Client'] = 'admin'

const responseBody = <T>(response: AxiosResponse<T>) => response.data

export const requests = {
    get: <T>(url: string) => requester.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => requester.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => requester.put<T>(url, body).then(responseBody),
    patch: <T>(url: string, body: {}) => requester.patch<T>(url, body).then(responseBody),
    delete: <T>(url: string) => requester.delete<T>(url).then(responseBody),
}

export type LocalizedText = Record<string, string>
