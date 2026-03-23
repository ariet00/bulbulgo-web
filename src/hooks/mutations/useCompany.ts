import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '@/apis/company';
import { COMPANY_KEYS } from '../queries/useCompany';
import {
    CompanyCreate, CompanyUpdate,
    CompanyBranchCreate, CompanyBranchUpdate,
    CompanyEmployeeCreate, CompanyEmployeeUpdate,
    CompanyRoleCreate, CompanyRoleUpdate
} from '@/types/company';
import { toast } from 'sonner';

export const useCreateCompany = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyCreate) => companyApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.all });
            toast.success('Company created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create company');
        },
    });
};

export const useUpdateCompany = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyUpdate) => companyApi.update(slug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.detail(slug) });
            toast.success('Company updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update company');
        },
    });
};

// Branches
export const useCreateCompanyBranch = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyBranchCreate) => companyApi.createBranch(slug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.branches(slug) });
            toast.success('Branch created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create branch');
        },
    });
};

export const useUpdateCompanyBranch = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ branchId, data }: { branchId: number; data: CompanyBranchUpdate }) =>
            companyApi.updateBranch(slug, branchId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.branches(slug) });
            toast.success('Branch updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update branch');
        },
    });
};

export const useDeleteCompanyBranch = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (branchId: number) => companyApi.deleteBranch(slug, branchId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.branches(slug) });
            toast.success('Branch deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete branch');
        },
    });
};

// Employees
export const useAddCompanyEmployee = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyEmployeeCreate) => companyApi.addEmployee(slug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.employees(slug) });
            toast.success('Employee added successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to add employee');
        },
    });
};

export const useRemoveCompanyEmployee = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: number) => companyApi.removeEmployee(slug, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.employees(slug) });
            toast.success('Employee removed successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to remove employee');
        },
    });
};

export const useUpdateCompanyEmployeeRole = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ userId, data }: { userId: number; data: CompanyEmployeeUpdate }) =>
            companyApi.updateEmployeeRole(slug, userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.employees(slug) });
            toast.success('Employee role updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update employee role');
        },
    });
};

// Roles
export const useCreateCompanyRole = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyRoleCreate) => companyApi.createRole(slug, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.roles(slug) });
            toast.success('Role created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create role');
        },
    });
};

export const useUpdateCompanyRole = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roleId, data }: { roleId: number; data: CompanyRoleUpdate }) =>
            companyApi.updateRole(slug, roleId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.roles(slug) });
            toast.success('Role updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to update role');
        },
    });
};

export const useDeleteCompanyRole = (slug: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (roleId: number) => companyApi.deleteRole(slug, roleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPANY_KEYS.roles(slug) });
            toast.success('Role deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to delete role');
        },
    });
};

