import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, AdminComplaintStatus, AdminComplaintReasonInput } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminSetComplaintStatus = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: AdminComplaintStatus }) =>
            adminApi.setComplaintStatus(id, status),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: adminKeys.complaints() })
            qc.invalidateQueries({ queryKey: adminKeys.complaint(id) })
            toast.success('Статус жалобы обновлён')
        },
    })
}

export const useAdminDeleteComplaint = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteComplaint(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaints() })
            toast.success('Жалоба удалена')
        },
    })
}

// === Complaint reasons dictionary ===

export const useAdminCreateComplaintReason = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: AdminComplaintReasonInput) => adminApi.createComplaintReason(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaintReasons() })
            toast.success('Тип жалобы добавлен')
        },
    })
}

export const useAdminUpdateComplaintReason = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...body }: { id: number } & Partial<AdminComplaintReasonInput>) =>
            adminApi.updateComplaintReason(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaintReasons() })
            toast.success('Тип жалобы обновлён')
        },
    })
}

export const useAdminDeleteComplaintReason = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteComplaintReason(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaintReasons() })
            toast.success('Тип жалобы удалён')
        },
    })
}

export const useAdminReorderComplaintReasons = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (ids: number[]) => adminApi.reorderComplaintReasons(ids),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: adminKeys.complaintReasons() })
        },
    })
}

// === BulBul Go news ===
