import { requester } from '@/lib/requester';
import {
    Company, CompanyCreate, CompanyUpdate,
    CompanyBranch, CompanyBranchCreate, CompanyBranchUpdate,
    CompanyEmployee, CompanyEmployeeCreate, CompanyEmployeeUpdate,
    CompanyRole, CompanyRoleCreate, CompanyRoleUpdate
} from '@/types/company';

export const companyApi = {
    // Company
    create: async (data: CompanyCreate): Promise<Company> => {
        const response = await requester.post('/companies/', data);
        return response.data;
    },

    getMyCompanies: async (): Promise<Company[]> => {
        const response = await requester.get('/companies/me');
        return response.data;
    },

    get: async (slug: string): Promise<Company> => {
        const response = await requester.get(`/companies/${slug}`);
        return response.data;
    },

    update: async (slug: string, data: CompanyUpdate): Promise<Company> => {
        const response = await requester.put(`/companies/${slug}`, data);
        return response.data;
    },

    // Branches
    getBranches: async (slug: string): Promise<CompanyBranch[]> => {
        const response = await requester.get(`/companies/${slug}/branches`);
        return response.data;
    },

    createBranch: async (slug: string, data: CompanyBranchCreate): Promise<CompanyBranch> => {
        const response = await requester.post(`/companies/${slug}/branches`, data);
        return response.data;
    },

    updateBranch: async (slug: string, branchId: number, data: CompanyBranchUpdate): Promise<CompanyBranch> => {
        const response = await requester.put(`/companies/${slug}/branches/${branchId}`, data);
        return response.data;
    },

    deleteBranch: async (slug: string, branchId: number): Promise<void> => {
        await requester.delete(`/companies/${slug}/branches/${branchId}`);
    },

    // Employees
    getEmployees: async (slug: string): Promise<CompanyEmployee[]> => {
        const response = await requester.get(`/companies/${slug}/employees`);
        return response.data;
    },

    addEmployee: async (slug: string, data: CompanyEmployeeCreate): Promise<CompanyEmployee> => {
        const response = await requester.post(`/companies/${slug}/employees`, data);
        return response.data;
    },

    removeEmployee: async (slug: string, userId: number): Promise<void> => {
        await requester.delete(`/companies/${slug}/employees/${userId}`);
    },

    updateEmployeeRole: async (slug: string, userId: number, data: CompanyEmployeeUpdate): Promise<CompanyEmployee> => {
        const response = await requester.put(`/companies/${slug}/employees/${userId}`, data);
        return response.data;
    },

    // Roles
    getRoles: async (slug: string): Promise<CompanyRole[]> => {
        const response = await requester.get(`/companies/${slug}/roles`);
        return response.data;
    },

    createRole: async (slug: string, data: CompanyRoleCreate): Promise<CompanyRole> => {
        const response = await requester.post(`/companies/${slug}/roles`, data);
        return response.data;
    },

    updateRole: async (slug: string, roleId: number, data: CompanyRoleUpdate): Promise<CompanyRole> => {
        const response = await requester.put(`/companies/${slug}/roles/${roleId}`, data);
        return response.data;
    },

    deleteRole: async (slug: string, roleId: number): Promise<void> => {
        await requester.delete(`/companies/${slug}/roles/${roleId}`);
    },
};
