import type { Page } from '@doska/shared'
import { requests } from './base'

export type AdminComplaintTargetType = 'trip' | 'user' | 'listing'
export type AdminComplaintStatus = 'open' | 'resolved' | 'dismissed'

export interface AdminComplaintReporter {
    id: number
    name: string | null
    full_name: string | null
    username: string | null
    phone: string | null
    avatar_url: string | null
}

export interface AdminComplaintTarget {
    type: AdminComplaintTargetType
    id: number
    exists: boolean
    label: string | null
    subtitle: string | null
    owner_id: number | null
}

export interface AdminComplaint {
    id: number
    reporter_id: number | null
    reporter: AdminComplaintReporter | null
    target_type: AdminComplaintTargetType
    target_id: number
    target: AdminComplaintTarget | null
    reason: string
    description: string | null
    status: AdminComplaintStatus
    resolved_at: string | null
    resolved_by_id: number | null
    data: Record<string, any> | null
    created_at: string
}

export interface AdminComplaintListParams {
    q?: string
    target_type?: AdminComplaintTargetType
    status?: AdminComplaintStatus
    reason?: string
    reporter_id?: number
    target_id?: number
    date_from?: string
    date_to?: string
}

// Report screens in the app; the backend accepts any string (open set).
export type AdminComplaintContext = 'rideshare' | 'freight' | 'real_estate' | 'user' | (string & {})

export interface AdminComplaintReason {
    id: number
    text: string
    // Empty array = the reason is shown in every context.
    contexts: AdminComplaintContext[]
    is_active: boolean
    position: number
    created_at: string
}

export interface AdminComplaintReasonInput {
    text: string
    contexts: AdminComplaintContext[]
    is_active: boolean
    position?: number
}

// === BulBul Go news ===

export const complaintsAdminApi = {
    // Complaints (user reports on trips/users/listings)
    getComplaints: (page = 1, size = 40, filters?: AdminComplaintListParams) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (filters?.q) params.set('q', filters.q)
        if (filters?.target_type) params.set('target_type', filters.target_type)
        if (filters?.status) params.set('status', filters.status)
        if (filters?.reason) params.set('reason', filters.reason)
        if (filters?.reporter_id != null) params.set('reporter_id', String(filters.reporter_id))
        if (filters?.target_id != null) params.set('target_id', String(filters.target_id))
        if (filters?.date_from) params.set('date_from', filters.date_from)
        if (filters?.date_to) params.set('date_to', filters.date_to)
        return requests.get<Page<AdminComplaint>>(`/admin/complaints/?${params.toString()}`)
    },
    getComplaint: (id: number) => requests.get<AdminComplaint>(`/admin/complaints/${id}`),
    setComplaintStatus: (id: number, status: AdminComplaintStatus) =>
        requests.put<AdminComplaint>(`/admin/complaints/${id}/status`, { status }),
    deleteComplaint: (id: number) =>
        requests.delete<{ deleted: boolean }>(`/admin/complaints/${id}`),

    // Complaint reasons dictionary (admin-editable, served to the mobile app)
    getComplaintReasons: () =>
        requests.get<AdminComplaintReason[]>('/admin/complaints/reasons'),
    createComplaintReason: (body: AdminComplaintReasonInput) =>
        requests.post<AdminComplaintReason>('/admin/complaints/reasons', body),
    updateComplaintReason: (id: number, body: Partial<AdminComplaintReasonInput>) =>
        requests.put<AdminComplaintReason>(`/admin/complaints/reasons/${id}`, body),
    deleteComplaintReason: (id: number) =>
        requests.delete<{ deleted: boolean }>(`/admin/complaints/reasons/${id}`),
    reorderComplaintReasons: (ids: number[]) =>
        requests.put<AdminComplaintReason[]>('/admin/complaints/reasons/reorder', { ids }),
}
