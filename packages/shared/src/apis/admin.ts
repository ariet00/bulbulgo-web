import { requester } from '../lib/requester'
import { AxiosResponse } from 'axios'

export interface Page<T> {
    items: T[]
    total: number
    page: number
    size: number
}

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const requests = {
    get: <T>(url: string) => requester.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => requester.post<T>(url, body).then(responseBody),
    put: <T>(url: string, body: {}) => requester.put<T>(url, body).then(responseBody),
    delete: <T>(url: string) => requester.delete<T>(url).then(responseBody),
}

export const adminApi = {
    // Users
    getUsers: (page = 1, size = 40) =>
        requests.get<Page<any>>(`/admin/users/?page=${page}&size=${size}`),
    getUser: (id: number) => requests.get<any>(`/admin/users/${id}`),
    banUser: (id: number, isActive: boolean) =>
        requests.put<any>(`/admin/users/${id}/ban?is_active=${isActive}`, {}),

    // Companies
    getCompanies: (page = 1, size = 40) =>
        requests.get<Page<any>>(`/admin/companies/?page=${page}&size=${size}`),
    getCompany: (id: number) => requests.get<any>(`/admin/companies/${id}`),
    deleteCompany: (id: number) => requests.delete<any>(`/admin/companies/${id}`),

    // Trips
    getTrips: (page = 1, size = 40) =>
        requests.get<Page<any>>(`/admin/trips/?page=${page}&size=${size}`),
    getTrip: (id: number) => requests.get<any>(`/admin/trips/${id}`),
    deleteTrip: (id: number) => requests.delete<any>(`/admin/trips/${id}`),

    // Vehicles
    getVehicles: (page = 1, size = 40) =>
        requests.get<Page<any>>(`/admin/vehicles/?page=${page}&size=${size}`),
    getVehicle: (id: number) => requests.get<any>(`/admin/vehicles/${id}`),
    deleteVehicle: (id: number) => requests.delete<any>(`/admin/vehicles/${id}`),

    // Properties
    getProperties: (page = 1, size = 40) =>
        requests.get<Page<any>>(`/admin/properties/?page=${page}&size=${size}`),
    getProperty: (id: number) => requests.get<any>(`/admin/properties/${id}`),
    createProperty: (data: any) => requests.post<any>('/admin/properties/', data),
    updateProperty: (id: number, data: any) => requests.put<any>(`/admin/properties/${id}`, data),
    deleteProperty: (id: number) => requests.delete<any>(`/admin/properties/${id}`),

    // Chats
    getChats: (page = 1, size = 40) =>
        requests.get<Page<any>>(`/admin/chats/?page=${page}&size=${size}`),
    getChat: (id: number) => requests.get<any>(`/admin/chats/${id}`),

    // Analytics
    getAnalytics: () => requests.get<any>('/admin/analytics/'),
}
