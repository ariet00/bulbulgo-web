import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from '@/hooks/queries/admin'
import { toast } from 'sonner'

export const useAdminBanUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            adminApi.banUser(id, isActive),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.users() })
            queryClient.invalidateQueries({ queryKey: adminKeys.user(id) })
            toast.success('User status updated')
        },
    })
}

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

export const useAdminDeleteTrip = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteTrip(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.trips() })
            queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Trip deleted')
        },
    })
}

export const useAdminDeleteVehicle = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteVehicle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.vehicles() })
            queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })
            toast.success('Vehicle deleted')
        },
    })
}

export const useAdminCreateProperty = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => adminApi.createProperty(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
            toast.success('Property created')
        },
    })
}

export const useAdminUpdateProperty = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            adminApi.updateProperty(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
            queryClient.invalidateQueries({ queryKey: adminKeys.property(id) })
            toast.success('Property updated')
        },
    })
}

export const useAdminDeleteProperty = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => adminApi.deleteProperty(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.properties() })
            toast.success('Property deleted')
        },
    })
}
