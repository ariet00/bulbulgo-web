import { requests } from './base'

// Tglab (apps/tglab): операторы внутреннего кабинета продвижения в Telegram.
// Саморегистрации нет — учётки заводит админ здесь.

export interface AdminTglabUser {
    id: number
    username: string
    email: string | null
    full_name: string | null
    status: string
    role_slug: string | null
    max_accounts: number
    max_running_tasks: number
    created_at: string | null
    last_online_at: string | null
}

export interface AdminTglabUsersPage {
    items: AdminTglabUser[]
    total: number
    page: number
    size: number
}

export interface AdminTglabRole {
    id: number
    slug: string
    name: string
}

export interface AdminTglabUserCreate {
    username: string
    password: string
    email?: string | null
    name?: string | null
    surname?: string | null
    role_slug: string
    max_accounts: number
    max_running_tasks: number
}

export type AdminTglabUserUpdate = Partial<Omit<AdminTglabUserCreate, 'username'>>

export const tglabAdminApi = {
    getTglabRoles: () => requests.get<AdminTglabRole[]>('/admin/tglab/roles'),
    getTglabUsers: (page = 1, size = 20, q?: string) => {
        const params = new URLSearchParams({ page: String(page), size: String(size) })
        if (q) params.set('q', q)
        return requests.get<AdminTglabUsersPage>(`/admin/tglab/users?${params}`)
    },
    createTglabUser: (body: AdminTglabUserCreate) =>
        requests.post<AdminTglabUser>('/admin/tglab/users', body),
    updateTglabUser: (id: number, body: AdminTglabUserUpdate) =>
        requests.patch<AdminTglabUser>(`/admin/tglab/users/${id}`, body),
    // Снимает роль — аккаунт и его данные остаются.
    revokeTglabAccess: (id: number) =>
        requests.delete<{ success: boolean }>(`/admin/tglab/users/${id}`),
}
