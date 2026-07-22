import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { adminApi, SeederRunRequest } from '@/apis/admin'

export const useAdminRunSeeders = () => {
    return useMutation({
        mutationFn: (data: SeederRunRequest) => adminApi.runSeeders(data),
        onSuccess: (results) => {
            const failed = results.filter((r) => r.status === 'failed')
            if (failed.length > 0) {
                toast.error(`Сидеры с ошибками: ${failed.map((r) => r.name).join(', ')}`)
            } else {
                toast.success('Сидеры выполнены')
            }
        },
    })
}
