import { requests } from './base'
import type { LocalizedText } from './base'

export interface AdminServiceNavItem {
    label: LocalizedText
    icon: string
    kind: 'url' | 'route'
    value: string
}

export interface AdminService {
    id: number
    slug: string
    type: 'native' | 'webview'
    position: number
    label: LocalizedText
    description: LocalizedText
    icon: string | null
    // HEX-цвет значка (#RRGGBB); null — приложение подберёт цвет само
    color: string | null
    badge: 'new' | 'soon' | null
    show_in_tabs: boolean
    url: string | null
    auth: boolean
    // false — вебвью без нативной шапки (страница рисует свою)
    app_bar: boolean
    nav_items: AdminServiceNavItem[]
    enabled: boolean
    created_at: string | null
    /** slug группы «Главной»; группа у сервиса одна, null — вне групп */
    group: string | null
}

export interface AdminServiceCreate {
    slug: string
    type: 'native' | 'webview'
    label?: LocalizedText
    description?: LocalizedText
    icon?: string | null
    color?: string | null
    badge?: 'new' | 'soon' | null
    show_in_tabs?: boolean
    url?: string | null
    auth?: boolean
    app_bar?: boolean
    nav_items?: AdminServiceNavItem[]
    enabled?: boolean
    position?: number
    /** slug группы; null — оставить/убрать вне групп */
    group?: string | null
}

// slug/type иммутабельны после создания (бэк их игнорирует в PATCH)
export type AdminServiceUpdate = Partial<Omit<AdminServiceCreate, 'slug' | 'type'>>

export const appServicesAdminApi = {
    // Mobile app services (home hub cards / tabs / webview services)
    getServices: () => requests.get<AdminService[]>('/admin/services/'),
    getService: (id: number) => requests.get<AdminService>(`/admin/services/${id}`),
    createService: (body: AdminServiceCreate) =>
        requests.post<AdminService>('/admin/services/', body),
    updateService: (id: number, body: AdminServiceUpdate) =>
        requests.patch<AdminService>(`/admin/services/${id}`, body),
    deleteService: (id: number) =>
        requests.delete<{ deleted: boolean }>(`/admin/services/${id}`),
}
