import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminAdCreate, AdminAdUpdate } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminCreateAd = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminAdCreate) => adminApi.createAd(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.ads() })
            toast.success('Реклама создана')
        },
    })
}

export const useAdminUpdateAd = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminAdUpdate }) =>
            adminApi.updateAd(id, body),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: adminKeys.ads() })
            qc.invalidateQueries({ queryKey: adminKeys.ad(id) })
            toast.success('Реклама обновлена')
        },
    })
}

export const useAdminDeleteAd = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteAd(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.ads() })
            toast.success('Реклама удалена')
        },
    })
}

// === Mobile app services (home hub / tabs / webview) ===
