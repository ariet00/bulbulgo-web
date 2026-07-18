import type { Page } from '@doska/shared'
import { requests } from './base'

export interface AdminCompanyCreate {
    owner_user_id: number
    name: string
    slug: string
    type: string
    category?: string
    description?: string
    status?: string
    legal_form?: 'ip' | 'legal'
    timezone?: string
    currency?: string
    default_working_start?: string
    default_working_end?: string
}

export interface AdminCompanyUpdate {
    owner_user_id?: number
    name?: string
    slug?: string
    description?: string
    status?: string
    type?: string
    category?: string
    legal_form?: 'ip' | 'legal'
}

// === Celery beat ===

export const companiesAdminApi = {
    // Companies
    getCompanies: (page = 1, size = 40, q?: string, type?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        if (type) params.set('type', type)
        return requests.get<Page<any>>(`/admin/companies/?${params.toString()}`)
    },
    getCompany: (id: number) => requests.get<any>(`/admin/companies/${id}`),
    createCompany: (body: AdminCompanyCreate) =>
        requests.post<any>('/admin/companies/', body),
    updateCompany: (id: number, body: AdminCompanyUpdate) =>
        requests.patch<any>(`/admin/companies/${id}`, body),
    deleteCompany: (id: number) => requests.delete<any>(`/admin/companies/${id}`),
}
