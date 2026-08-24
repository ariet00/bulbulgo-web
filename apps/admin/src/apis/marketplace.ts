import { requester } from '@doska/shared'
import { AxiosResponse } from 'axios'

const responseBody = <T>(response: AxiosResponse<T>) => response.data

const req = {
    get: <T>(url: string) => requester.get<T>(url).then(responseBody),
    post: <T>(url: string, body: {}) => requester.post<T>(url, body).then(responseBody),
    patch: <T>(url: string, body: {}) => requester.patch<T>(url, body).then(responseBody),
    delete: <T>(url: string) => requester.delete<T>(url).then(responseBody),
}

// i18n label/unit map, e.g. { ru: 'Год', ky: 'Жыл', en: 'Year' }
export type LabelMap = Record<string, string>

export const ATTRIBUTE_TYPES = [
    'int',
    'decimal',
    'enum',
    'multi_enum',
    'bool',
    'string',
    'range',
] as const
export type AttributeType = (typeof ATTRIBUTE_TYPES)[number]

export const APPLIES_TO = ['both', 'offer', 'want'] as const
export const LISTING_STATUSES = [
    'draft',
    'moderation',
    'active',
    'sold',
    'archived',
] as const

// ── categories ──
export interface McGroupDef {
    id?: number
    key: string
    label: LabelMap
    sort_order: number
}

/** Группа полей формы — строка marketplace.attribute_groups. */
export interface McGroup {
    id: number
    category_id: number
    category_slug?: string | null
    key: string
    label: LabelMap
    sort_order: number
    is_active: boolean
}

export interface McGroupCreate {
    category_id: number
    key: string
    label: LabelMap
    sort_order?: number
}

export interface McGroupUpdate {
    key?: string
    label?: LabelMap
    sort_order?: number
    is_active?: boolean
}

export interface McCategoryNode {
    id: number
    slug: string
    parent_id: number | null
    path: string
    sort_order: number
    is_active: boolean
    label: LabelMap
    icon?: string | null
    attribute_groups?: McGroupDef[]
    children: McCategoryNode[]
}

export interface McCategoryCreate {
    slug: string
    label: LabelMap
    parent_id?: number | null
    icon?: string | null
    sort_order?: number
}

export interface McCategoryUpdate {
    slug?: string
    label?: LabelMap
    parent_id?: number | null
    icon?: string | null
    sort_order?: number
    is_active?: boolean
}

// ── attributes ──
export interface McAttributeOption {
    id?: number
    value: string
    label: LabelMap
    sort_order: number
    is_active?: boolean
}

export interface McAttribute {
    id: number
    key: string
    type: AttributeType
    is_active: boolean
    /** категория-владелец (обычно корень вертикали); key уникален внутри неё */
    category_id: number
    category_slug?: string | null
    label: LabelMap
    unit?: LabelMap | null
    role?: string | null
    options: McAttributeOption[]
}

export interface McAttributeCreate {
    category_id: number
    key: string
    type: AttributeType
    label: LabelMap
    unit?: LabelMap | null
    role?: string | null
    options?: McAttributeOption[]
}

export interface McAttributeUpdate {
    category_id?: number
    key?: string
    type?: AttributeType
    label?: LabelMap
    unit?: LabelMap | null
    is_active?: boolean
    role?: string | null
    options?: McAttributeOption[]
}

// ── bindings ──
export interface McDependsOn {
    key: string
    values: string[]
}

export interface McEffectiveAttribute {
    attribute_id: number
    key: string
    type: AttributeType
    label: LabelMap
    unit?: LabelMap | null
    is_required: boolean
    is_filterable: boolean
    applies_to: string
    sort_order: number
    role?: string | null
    group?: string | null
    group_label?: LabelMap
    deal_types?: string[]
    required_deal_types?: string[]
    depends_on?: McDependsOn | null
    options: McAttributeOption[]
}

export interface McBinding {
    id: number
    category_id: number
    attribute_id: number
    is_required: boolean
    is_filterable: boolean
    applies_to: string
    sort_order: number
    is_active: boolean
    /** типы сделки, при которых поле показывается / обязательно (пусто = любые) */
    deal_types?: string[]
    required_deal_types?: string[]
    depends_on?: McDependsOn | null
    group_id?: number | null
    group?: string | null
}

export interface McBindingCreate {
    category_id: number
    attribute_id: number
    is_required?: boolean
    is_filterable?: boolean
    applies_to?: string
    sort_order?: number
    deal_types?: string[]
    required_deal_types?: string[]
    depends_on?: McDependsOn | null
    /** 0 снимает группу */
    group_id?: number
}

export interface McBindingUpdate {
    is_required?: boolean
    is_filterable?: boolean
    applies_to?: string
    sort_order?: number
    is_active?: boolean
    deal_types?: string[]
    required_deal_types?: string[]
    depends_on?: McDependsOn | null
    group_id?: number
}

// ── listings ──
export interface McListing {
    id: number
    category_id: number
    kind: string
    deal_type?: string | null
    status: string
    user_id: number
    company_id?: number | null
    region_id?: number | null
    price?: number | null
    currency_id?: number | null
    currency_code?: string | null
    lat?: number | null
    lng?: number | null
    title?: string | Record<string, string> | null
    description?: string | null
    attributes: Record<string, unknown>
    photos: { url: string; sort: number }[]
    created_at?: string | null
}

export interface McListingPage {
    total: number
    items: McListing[]
}

export interface McListingsParams {
    category_id?: number
    kind?: string
    deal_type?: string
    region_id?: number
    status?: string
    skip?: number
    limit?: number
}

const base = '/admin/marketplace'

export const marketplaceAdminApi = {
    // categories
    getCategories: (includeInactive = true) =>
        req.get<McCategoryNode[]>(`${base}/categories?include_inactive=${includeInactive}`),
    createCategory: (body: McCategoryCreate) =>
        req.post<McCategoryNode>(`${base}/categories`, body),
    updateCategory: (id: number, body: McCategoryUpdate) =>
        req.patch<McCategoryNode>(`${base}/categories/${id}`, body),
    deleteCategory: (id: number) => req.delete<{ success: boolean }>(`${base}/categories/${id}`),
    getCategoryAttributes: (id: number) =>
        req.get<McEffectiveAttribute[]>(`${base}/categories/${id}/attributes`),
    getCategoryBindings: (id: number) =>
        req.get<McBinding[]>(`${base}/categories/${id}/bindings`),

    // attribute groups
    getCategoryGroups: (id: number) =>
        req.get<McGroup[]>(`${base}/categories/${id}/groups`),
    createGroup: (body: McGroupCreate) => req.post<McGroup>(`${base}/groups`, body),
    updateGroup: (id: number, body: McGroupUpdate) =>
        req.patch<McGroup>(`${base}/groups/${id}`, body),
    deleteGroup: (id: number) => req.delete<{ success: boolean }>(`${base}/groups/${id}`),

    // attributes
    getAttributes: (includeInactive = true) =>
        req.get<McAttribute[]>(`${base}/attributes?include_inactive=${includeInactive}`),
    createAttribute: (body: McAttributeCreate) =>
        req.post<McAttribute>(`${base}/attributes`, body),
    updateAttribute: (id: number, body: McAttributeUpdate) =>
        req.patch<McAttribute>(`${base}/attributes/${id}`, body),
    deleteAttribute: (id: number) => req.delete<{ success: boolean }>(`${base}/attributes/${id}`),

    // bindings
    createBinding: (body: McBindingCreate) => req.post<McBinding>(`${base}/bindings`, body),
    updateBinding: (id: number, body: McBindingUpdate) =>
        req.patch<McBinding>(`${base}/bindings/${id}`, body),
    deleteBinding: (id: number) => req.delete<{ success: boolean }>(`${base}/bindings/${id}`),

    // listings (moderation)
    getListings: (params: McListingsParams = {}) => {
        const sp = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') sp.set(k, String(v))
        })
        const qs = sp.toString()
        return req.get<McListingPage>(`${base}/listings${qs ? `?${qs}` : ''}`)
    },
    setListingStatus: (id: number, status: string) =>
        req.patch<McListing>(`${base}/listings/${id}/status`, { status }),
}
