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

/** Слаги, у которых в приложении есть нативный таб. Повторяет MainTabType в
 *  native_apps/bulbul_go/lib/core/models/main_tab.dart: таб рисует клиент, и
 *  берёт он его по совпадению слага (AppService.nativeTab). Новый таб =
 *  релиз приложения плюс строка здесь. */
export const TAB_SLUGS = ['rideshare', 'freight', 'bus', 'real_estate'] as const

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
    /** slug корневой категории каталога, которой бэк скоупит marketplace-API
     *  по X-Service-Slug (недвижимость → real_estate, webview-авторынок →
     *  auto). Не зависит от типа сервиса. Слаг сервиса и слаг категории — из
     *  разных пространств имён, поэтому связка явная. */
    marketplace_root: string | null
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
    /** slug корневой категории каталога (native и webview) */
    marketplace_root?: string | null
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

/**
 * Может ли у сервиса быть нативный таб.
 *
 * Клиент рисует таб только для native-сервиса, слаг которого совпал с
 * MainTabType (visibleMainTabsProvider + AppService.nativeTab). Для webview и
 * для native с незнакомым слагом show_in_tabs не значит ничего — поэтому
 * админка его там не показывает и не пишет.
 */
export const canHaveTab = (s: {
    type: string
    slug: string
    parent_slug: string | null
}) =>
    s.type === 'native' &&
    !s.parent_slug &&
    (TAB_SLUGS as readonly string[]).includes(s.slug)

/** Где сервис виден пользователю — один разбор на список, форму и превью. */
export type PlacementKind = 'home' | 'tab' | 'child' | 'feed_chip' | 'hidden'

export interface Placement {
    kind: PlacementKind
    label: string
    /** уточнение: слаг родителя, имя таба — то, что не влезло в label */
    hint?: string
}

/**
 * Итоговое размещение сервиса — из комбинации hidden / parent_slug /
 * show_in_tabs. Состояние enabled сюда не входит: выключенный сервис не
 * меняет места, он просто не выдаётся клиенту.
 */
export function servicePlacements(s: AdminService): Placement[] {
    if (s.hidden) {
        return [{ kind: 'hidden', label: 'Скрыт', hint: 'только по диплинку' }]
    }
    if (s.parent_slug === HOME_FEED_PARENT_SLUG) {
        return [
            {
                kind: 'feed_chip',
                label: 'Чип ленты',
                hint: s.service ?? undefined,
            },
        ]
    }
    if (s.parent_slug) {
        return [{ kind: 'child', label: 'Внутри раздела', hint: s.parent_slug }]
    }
    const placements: Placement[] = [{ kind: 'home', label: 'Главная' }]
    if (canHaveTab(s) && s.show_in_tabs) {
        placements.push({ kind: 'tab', label: 'Таб' })
    }
    return placements
}

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
    // Драг знает весь новый порядок уровня — шлём список целиком (см.
    // ServiceReorder на бэке: слаги одного уровня, position = индекс).
    reorderServices: (services: string[]) =>
        requests.post<AdminService[]>('/admin/services/reorder', { services }),
}
