import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    marketplaceAdminApi,
    McAttributeCreate,
    McAttributeUpdate,
    McBindingCreate,
    McBindingUpdate,
    McCategoryCreate,
    McCategoryUpdate,
} from '@/apis/marketplace'
import { mpKeys } from '@/hooks/queries/marketplace'

// ── categories ──
export const useMpCreateCategory = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: McCategoryCreate) => marketplaceAdminApi.createCategory(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Категория создана')
        },
    })
}

export const useMpUpdateCategory = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: McCategoryUpdate }) =>
            marketplaceAdminApi.updateCategory(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Категория обновлена')
        },
    })
}

export const useMpDeleteCategory = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => marketplaceAdminApi.deleteCategory(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Категория скрыта (soft-delete)')
        },
    })
}

// ── attributes ──
export const useMpCreateAttribute = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: McAttributeCreate) => marketplaceAdminApi.createAttribute(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Атрибут создан')
        },
    })
}

export const useMpUpdateAttribute = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: McAttributeUpdate }) =>
            marketplaceAdminApi.updateAttribute(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Атрибут обновлён')
        },
    })
}

export const useMpDeleteAttribute = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => marketplaceAdminApi.deleteAttribute(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Атрибут скрыт (soft-delete)')
        },
    })
}

// ── bindings ──
export const useMpCreateBinding = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: McBindingCreate) => marketplaceAdminApi.createBinding(body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Атрибут привязан')
        },
    })
}

export const useMpUpdateBinding = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, body }: { id: number; body: McBindingUpdate }) =>
            marketplaceAdminApi.updateBinding(id, body),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Привязка обновлена')
        },
    })
}

export const useMpDeleteBinding = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => marketplaceAdminApi.deleteBinding(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Привязка удалена')
        },
    })
}

// ── listings ──
export const useMpSetListingStatus = () => {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            marketplaceAdminApi.setListingStatus(id, status),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: mpKeys.all })
            toast.success('Статус обновлён')
        },
    })
}
