import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

/** Каталог типов ботов. Меняется только с релизом бэкенда — не перезапрашиваем. */
export const useAdminBotTypes = () =>
    useQuery({
        queryKey: adminKeys.botTypes(),
        queryFn: () => adminApi.getBotTypes(),
        staleTime: Infinity,
    })
