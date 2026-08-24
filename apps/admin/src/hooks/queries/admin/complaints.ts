import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AdminComplaintListParams, adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminComplaints = (
    page: number = 1,
    size: number = 40,
    filters?: AdminComplaintListParams,
) => {
    return useQuery({
        queryKey: [...adminKeys.complaints(), { page, size, ...(filters ?? {}) }],
        queryFn: () => adminApi.getComplaints(page, size, filters),
        placeholderData: keepPreviousData,
    })
}

export const useAdminComplaint = (id: number) => {
    return useQuery({
        queryKey: adminKeys.complaint(id),
        queryFn: () => adminApi.getComplaint(id),
        enabled: !!id,
    })
}

export const useAdminComplaintReasons = () => {
    return useQuery({
        queryKey: adminKeys.complaintReasons(),
        queryFn: () => adminApi.getComplaintReasons(),
    })
}
