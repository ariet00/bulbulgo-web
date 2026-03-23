import { create } from "zustand";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    registerDeviceToken,
} from "@/apis/notification";
import { Notification } from "@/types/notification";

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    registerToken: (token: string) => Promise<void>;
    addNotification: (notification: Notification) => void;
    setNotifications: (notifications: Notification[]) => void;
    setUnreadCount: (count: number) => void;
    setLoading: (isLoading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    markAsRead: async (id: number) => {
        try {
            await markAsRead(id);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error: any) {
            console.error("Failed to mark as read", error);
        }
    },

    markAllAsRead: async () => {
        try {
            const updatedNotifications = await markAllAsRead();
            set({ notifications: updatedNotifications, unreadCount: 0 });
        } catch (error: any) {
            console.error("Failed to mark all as read", error);
        }
    },

    registerToken: async (token: string) => {
        try {
            await registerDeviceToken(token, "web");
        } catch (error: any) {
            console.error("Failed to register device token", error);
        }
    },

    setNotifications: (notifications: Notification[]) => {
        set({ notifications, isLoading: false });
    },

    setUnreadCount: (count: number) => {
        set({ unreadCount: count });
    },

    setLoading: (isLoading: boolean) => {
        set({ isLoading });
    },

    addNotification: (notification: Notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },
}));
