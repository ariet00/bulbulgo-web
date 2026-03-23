export interface Notification {
    id: number;
    user_id: number;
    title: string;
    body: string;
    type: string;
    is_read: boolean;
    created_at: string;
    data?: Record<string, any>;
    entity_id?: number;
    entity_type?: string;
}

export interface DeviceToken {
    id: number;
    user_id: number;
    token: string;
    device_type: string;
    created_at: string;
}
