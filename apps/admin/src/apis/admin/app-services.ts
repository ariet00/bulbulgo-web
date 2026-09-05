import { requests } from './base'
import type { LocalizedText } from './base'

export interface AdminServiceNavItem {
    label: LocalizedText
    icon: string
    kind: 'url' | 'route'
    value: string
}

/** Родитель чипов ленты «Главной» — backend HOME_FEED_PARENT_SLUG
 *  (core/seeding/seeders/mobile_services.py). Дети этого сервиса и есть чипы. */
export const HOME_FEED_PARENT_SLUG = 'home_feed'

/** Шаблоны блока ленты. Повторяет FEED_TEMPLATES в
 *  backend/apps/services/schemas.py и homeFeedTemplates в home_feed.dart:
 *  шаблон рисует приложение, поэтому новый пункт = релиз приложения. */
export const FEED_TEMPLATES = ['common'] as const
export type FeedTemplate = (typeof FEED_TEMPLATES)[number]

export const FEED_TEMPLATE_LABELS: Record<FeedTemplate, string> = {
    common: 'common — шапка сервиса и список из фида',
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
    badge: 'new' | 'soon' | 'hit' | null
    show_in_tabs: boolean
    /** true — нигде не показывается, открывается только по диплинку/переходу */
    hidden: boolean
    url: string | null
    auth: boolean
    // false — вебвью без нативной шапки (страница рисует свою)
    app_bar: boolean
    nav_items: AdminServiceNavItem[]
    enabled: boolean
    created_at: string | null
    /** slug группы «Главной»; группа у сервиса одна, null — вне групп */
    group: string | null
    /** slug родителя: сервис — плитка раздела, на «Главной» не показывается */
    parent_slug: string | null
    /** чип ленты «Главной»: slug сервиса, в который ведёт блок под чипом */
    service: string | null
    /** чип ленты «Главной»: шаблон блока; null — блок вшит в приложение по slug'у */
    template: FeedTemplate | null
}

export interface AdminServiceCreate {
    slug: string
    type: 'native' | 'webview'
    label?: LocalizedText
    description?: LocalizedText
    icon?: string | null
    color?: string | null
    badge?: 'new' | 'soon' | 'hit' | null
    show_in_tabs?: boolean
    hidden?: boolean
    url?: string | null
    auth?: boolean
    app_bar?: boolean
    nav_items?: AdminServiceNavItem[]
    enabled?: boolean
    position?: number
    /** slug группы; null — оставить/убрать вне групп */
    group?: string | null
    /** slug родителя; null — сервис остаётся карточкой «Главной» */
    parent_slug?: string | null
    /** чип ленты «Главной»: сервис-цель блока и шаблон блока */
    service?: string | null
    template?: FeedTemplate | null
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
