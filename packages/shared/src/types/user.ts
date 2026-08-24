export interface User {
    id: number;
    email: string;
    username: string;
    phone?: string;
    // active | banned — источник истины; is_active — легаси-зеркало
    status?: string;
    is_active: boolean;
    avatar?: string;
    created_at?: string;
    role_slug?: string;
    data?: UserData;
}


// Ответ GET /users/{id}/public (backend UserPublic).
export interface UserPublic {
    id: number;
    username: string;
    // Номер наружу не отдаётся — только факт подтверждения.
    phone_verified?: boolean;
    created_at?: string;
    last_online_at?: string;
    rating?: number;
    review_count?: number;
    avatar_url?: string;
    name?: string;
    surname?: string;
    patronymic?: string;
    full_name?: string;
    data?: UserPublicData;
}

// Автор поездки/объявления, вложенный в Trip и прочие ответы BulBul Go
// (backend apps/bulbulgo/shared/schemas/user.py:TripUser).
export interface TripUser {
    id: number;
    username: string;
    created_at?: string;
    name?: string;
    surname?: string;
    patronymic?: string;
    full_name?: string;
    rating?: number;
    email?: string;
    phone?: string;
    phone_verified?: boolean;
    avatar_url?: string;
    avatar_thumbnail_url?: string;
    gender?: string;
    birth_date?: string;
    city_id?: number;
}

export interface UserData {
    response_time_minutes?: number;
    response_rate_percent?: number;
    [key: string]: any;
}

// Публичный срез users.data (backend UserData) — служебные ключи JSONB
// в /users/{id}/public не попадают.
export interface UserPublicData {
    response_time_minutes?: number;
    response_rate_percent?: number;
}

export interface UserSession {
    id: number;
    device_info?: string;
    ip_address?: string;
    last_used_at: string;
    is_active: boolean;
    is_current?: boolean;
}
