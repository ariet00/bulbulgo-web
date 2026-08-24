import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminCurrencies = () => {
    return useQuery({
        queryKey: [...adminKeys.currencies(), 'list'],
        queryFn: () => adminApi.getCurrencies(),
    })
}

export const useAdminCurrencyRates = () => {
    return useQuery({
        queryKey: [...adminKeys.currencies(), 'rates'],
        queryFn: () => adminApi.getCurrencyRates(),
    })
}
