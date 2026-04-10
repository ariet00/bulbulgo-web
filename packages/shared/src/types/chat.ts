import { User } from "./user";

export interface Message {
    id: number;
    chat_id: number;
    sender_id: number;
    content: string;
    is_read: boolean;
    created_at: string;
    parent_id?: number;
    attachments?: string[];
    sender?: User;
}

export interface Chat {
    id: number;
    company_id?: number;
    trip_id?: number;
    category?: string;
    initiator_id: number;
    receiver_id: number;
    buyer?: User; // Keeping these for compatibility if they are used elsewhere as roles
    seller?: User;
    initiator?: User;
    receiver?: User;
    last_message?: Message;
}

export interface CreateChatRequest {
    company_id?: number;
    trip_id?: number;
    category?: string;
    receiver_id: number;
}

export interface SendMessageRequest {
    content: string;
    attachments?: string[];
    parent_id?: number;
}
