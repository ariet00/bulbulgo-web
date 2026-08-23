import { requests } from './base'
import type { LocalizedText } from './base'

export interface AdminServiceGroup {
    id: number
    slug: string
    position: number
    enabled: boolean
    label: LocalizedText
    icon: string | null
    /** состав в порядке админки; slug'и сервисов, включая выключенные */
    services: string[]
    created_at: string | null
}

export interface AdminServiceGroupList {
    groups: AdminServiceGroup[]
    /** сервисы вне групп — на «Главной» падают в безымянную секцию «Другое» */
    ungrouped: string[]
}

export interface AdminServiceGroupCreate {
    slug: string
    label?: LocalizedText
    icon?: string | null
    position?: number
    enabled?: boolean
}

// slug иммутабелен: на него ссылается сохранённый порядок пользователей
export type AdminServiceGroupUpdate = Partial<
    Omit<AdminServiceGroupCreate, 'slug'>
>

export const serviceGroupsAdminApi = {
    getServiceGroups: () =>
        requests.get<AdminServiceGroupList>('/admin/services/groups/'),
    createServiceGroup: (body: AdminServiceGroupCreate) =>
        requests.post<AdminServiceGroup>('/admin/services/groups/', body),
    updateServiceGroup: (id: number, body: AdminServiceGroupUpdate) =>
        requests.patch<AdminServiceGroup>(`/admin/services/groups/${id}`, body),
    deleteServiceGroup: (id: number) =>
        requests.delete<{ deleted: boolean }>(`/admin/services/groups/${id}`),
    /** Полная замена состава: слаги в нужном порядке. */
    setServiceGroupItems: (id: number, services: string[]) =>
        requests.put<AdminServiceGroup>(`/admin/services/groups/${id}/items`, {
            services,
        }),
}
