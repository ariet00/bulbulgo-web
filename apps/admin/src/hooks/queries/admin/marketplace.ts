import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

/** Корни каталога маркетплейса — подсказка для поля marketplace_root.
 *  Без права MARKETPLACE_VIEW запрос вернёт 403: не ретраим, форма в этом
 *  случае показывает обычное поле ввода. */
export const useAdminMarketplaceRoots = () =>
    useQuery({
        queryKey: adminKeys.marketplaceCategories(),
        queryFn: () => adminApi.getMarketplaceCategories(),
        retry: false,
        staleTime: 5 * 60 * 1000,
    })
