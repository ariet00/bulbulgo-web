import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    adminApi,
    AdminService,
    AdminServiceCreate,
    AdminServiceUpdate,
} from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

/** Снимок списка сервисов для отката оптимистичной правки. */
type Snapshot = { prev?: AdminService[] }

/** Общая часть оптимистичных мутаций списка: заморозить рефетч, снять
 *  снимок и применить патч к кэшу. */
const useOptimisticServices = () => {
    const qc = useQueryClient()

    const patch = async (
        apply: (rows: AdminService[]) => AdminService[],
    ): Promise<Snapshot> => {
        await qc.cancelQueries({ queryKey: adminKeys.services() })
        const prev = qc.getQueryData<AdminService[]>(adminKeys.services())
        if (prev) qc.setQueryData(adminKeys.services(), apply(prev))
        return { prev }
    }

    const rollback = (ctx?: Snapshot) => {
        if (ctx?.prev) qc.setQueryData(adminKeys.services(), ctx.prev)
    }

    const settle = () =>
        qc.invalidateQueries({ queryKey: adminKeys.services() })

    return { qc, patch, rollback, settle }
}

export const useAdminCreateService = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminServiceCreate) => adminApi.createService(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.services() })
            toast.success('Сервис создан')
        },
    })
}

/**
 * Правка сервиса. Список обновляется оптимистично: свитчи в дереве не ждут
 * ответа и не блокируют соседние строки.
 *
 * ``silent`` — для инлайновых переключателей, где тост на каждый клик лишний.
 */
export const useAdminUpdateService = ({ silent = false } = {}) => {
    const { qc, patch, rollback, settle } = useOptimisticServices()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: AdminServiceUpdate }) =>
            adminApi.updateService(id, body),
        onMutate: ({ id, body }) =>
            patch((rows) =>
                rows.map((s) => (s.id === id ? { ...s, ...body } : s)),
            ),
        onError: (_e, _vars, ctx) => rollback(ctx),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: adminKeys.service(id) })
            if (!silent) toast.success('Сервис обновлён')
        },
        onSettled: settle,
    })
}

export const useAdminDeleteService = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteService(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.services() })
            toast.success('Сервис удалён')
        },
    })
}

/**
 * Новый порядок уровня (корень «Главной» либо дети одного родителя) —
 * position раскладывается по индексу, как на бэке. Оптимистично: строка
 * должна встать на новое место в момент drop, а не после round-trip.
 */
export const useAdminReorderServices = () => {
    const { patch, rollback, settle } = useOptimisticServices()
    return useMutation({
        mutationFn: (services: string[]) => adminApi.reorderServices(services),
        onMutate: (services) => {
            const position = new Map(services.map((slug, i) => [slug, i]))
            return patch((rows) =>
                rows.map((s) =>
                    position.has(s.slug)
                        ? { ...s, position: position.get(s.slug)! }
                        : s,
                ),
            )
        },
        onError: (_e, _vars, ctx) => {
            rollback(ctx)
            toast.error('Не удалось сохранить порядок')
        },
        onSettled: settle,
    })
}
