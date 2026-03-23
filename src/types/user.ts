export interface User {
    id: number;
    email: string;
    username: string;
    phone?: string;
    is_active: boolean;
    avatar?: string;
    created_at?: string;
    role_slug?: string;
    data?: UserData;
}


export interface UserPublic {
    id: number;
    username: string;
    phone?: string;
    created_at?: string;
    last_online_at?: string;
    data?: UserData;
}

export interface UserData {
    response_time_minutes?: number;
    response_rate_percent?: number;
    [key: string]: any;
}

export interface UserSession {
    id: number;
    device_info?: string;
    ip_address?: string;
    last_used_at: string;
    is_active: boolean;
    is_current?: boolean;
}
