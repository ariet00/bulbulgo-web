import { create } from 'zustand'
import { toast } from 'sonner'


export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

interface NotificationState {
    addMessage: (notification: Omit<Notification, 'id'>) => void;
    removeMessage: (id: string) => void;
}

// TODO remove store
export const useToastStore = create<NotificationState>((set) => ({
    addMessage: (notification) => {
        const { type, message, duration } = notification
        const options = { duration: duration || 3000 }

        switch (type) {
            case 'success':
                return toast.success(message, options)
            case 'error':
                return toast.error(message, options)
            case 'warning':
                return toast.warning(message, options)
            case 'info':
                return toast.info(message, options)
            default:
                return toast(message, options)
        }
    },
    removeMessage: (id) => {
        toast.dismiss(id)
    },
}))
