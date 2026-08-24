import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminCompanyCreate, AdminCompanyUpdate } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminDeleteCompany = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.companies() })
            queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Company deleted')
        },
    })
}

export const useAdminCreateCompany = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminCompanyCreate) => adminApi.createCompany(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.companies() })
            toast.success('Компания создана')
        },
    })
}

export const useAdminUpdateCompany = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminCompanyUpdate }) =>
            adminApi.updateCompany(id, body),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: adminKeys.companies() })
            qc.invalidateQueries({ queryKey: adminKeys.company(id) })
            toast.success('Компания обновлена')
        },
    })
}
