import { useQuery } from '@tanstack/react-query';
import { companyApi } from '@/apis/company';

export const COMPANY_KEYS = {
    all: ['company'] as const,
    detail: (slug: string) => [...COMPANY_KEYS.all, 'detail', slug] as const,
    branches: (slug: string) => [...COMPANY_KEYS.all, 'branches', slug] as const,
    employees: (slug: string) => [...COMPANY_KEYS.all, 'employees', slug] as const,
    roles: (slug: string) => [...COMPANY_KEYS.all, 'roles', slug] as const,
    myCompanies: ['company', 'me'] as const,
};

export const useMyCompanies = () => {
    return useQuery({
        queryKey: COMPANY_KEYS.myCompanies,
        queryFn: () => companyApi.getMyCompanies(),
    });
};

export const useCompany = (slug: string) => {
    return useQuery({
        queryKey: COMPANY_KEYS.detail(slug),
        queryFn: () => companyApi.get(slug),
        enabled: !!slug,
    });
};

export const useCompanyBranches = (slug: string) => {
    return useQuery({
        queryKey: COMPANY_KEYS.branches(slug),
        queryFn: () => companyApi.getBranches(slug),
        enabled: !!slug,
    });
};

export const useCompanyEmployees = (slug: string) => {
    return useQuery({
        queryKey: COMPANY_KEYS.employees(slug),
        queryFn: () => companyApi.getEmployees(slug),
        enabled: !!slug,
    });
};

export const useCompanyRoles = (slug: string) => {
    return useQuery({
        queryKey: COMPANY_KEYS.roles(slug),
        queryFn: () => companyApi.getRoles(slug),
        enabled: !!slug,
    });
};

