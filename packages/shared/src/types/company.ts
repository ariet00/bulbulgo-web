export interface Company {
    id: number;
    owner_id: number;
    slug: string;
    name: string;
    description?: string;
    type?: string;
    status: 'active' | 'moderation' | 'disabled';
    settings?: Record<string, any>;
    data?: {
        logo?: string;
        banner?: string;
        contact_info?: any;
        social_links?: any;
        working_hours?: any;
        [key: string]: any;
    };
}

export interface CompanyCreate {
    name: string;
    slug: string;
    type: string;
    description?: string;
    settings?: Record<string, any>;
    data?: Record<string, any>;
}

export interface CompanyUpdate {
    name?: string;
    description?: string;
    type?: string;
    status?: string;
    settings?: Record<string, any>;
    data?: Record<string, any>;
}

export interface CompanyBranch {
    id: number;
    company_id: number;
    name: string;
    data?: Record<string, any>;
}

export interface CompanyBranchCreate {
    name: string;
    data?: Record<string, any>;
}

export interface CompanyBranchUpdate {
    name?: string;
    data?: Record<string, any>;
}

export interface CompanyRole {
    id: number;
    company_id: number;
    name: string;
    permissions?: string[];
}

export interface CompanyRoleCreate {
    name: string;
    permissions?: string[];
}

export interface CompanyRoleUpdate {
    name?: string;
    permissions?: string[];
}

export interface CompanyEmployee {
    company_id: number;
    user_id: number;
    role_id?: number;
    user?: any; // To be refined with User type
    role?: CompanyRole;
}

export interface CompanyEmployeeCreate {
    user_id: number;
    role_id?: number;
}

export interface CompanyEmployeeUpdate {
    role_id?: number;
}
