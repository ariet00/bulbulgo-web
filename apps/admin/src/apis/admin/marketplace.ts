import { requests } from './base'
import type { LocalizedText } from './base'

/** Узел каталога маркетплейса; здесь нужен только корневой уровень —
 *  подсказка для поля marketplace_root в карточке сервиса. */
export interface AdminMarketplaceCategory {
    id: number
    slug: string
    path: string
    is_active: boolean
    label: LocalizedText
    children: AdminMarketplaceCategory[]
}

export const marketplaceAdminApi = {
    // Дерево категорий целиком; корни — верхний уровень ответа.
    getMarketplaceCategories: () =>
        requests.get<AdminMarketplaceCategory[]>('/admin/marketplace/categories'),
}
