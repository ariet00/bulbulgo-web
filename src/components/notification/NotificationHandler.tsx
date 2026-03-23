"use client";

import { useEffect } from "react";
import { onMessage, getToken } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useUserStore } from "@/store/useUserStore";

import { useNotifications, useUnreadCount } from "@/hooks/queries/useNotificationQueries";

const NotificationHandler = () => {
    const { addNotification, registerToken, setNotifications, setUnreadCount, setLoading } = useNotificationStore();
    const { user } = useUserStore();
    const isGuest = useUserStore(state => state.isGuest());

    const { data: unreadCount } = useUnreadCount(!isGuest);

    useEffect(() => {
        if (unreadCount !== undefined) {
            setUnreadCount(unreadCount);
        }
    }, [unreadCount, setUnreadCount]);

    useEffect(() => {
        if (isGuest || !user) return;

        // Request permission and get token
        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    if (messaging) {
                        const token = await getToken(messaging, {
                            vapidKey: "BL-eR0WrwwwrcYnQvuHdG5hKcEMiwqcmF6UIzNCmvoPccMmJHYnlKHRgX-x7JroINWryCZ6GELSFCBgV-5fYeRU", // TODO: Replace with your VAPID key
                        });
                        if (token) {
                            await registerToken(token);
                        }
                    }
                }
            } catch (error) {
                console.error("An error occurred while retrieving token. ", error);
            }
        };

        requestPermission();

        // Listen for foreground messages
        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log("Message received. ", payload);
                // Add to store
                if (payload.notification) {
                    addNotification({
                        id: Date.now(), // Temporary ID until fetched from backend
                        user_id: user.id,
                        title: payload.notification.title || "",
                        body: payload.notification.body || "",
                        type: payload.data?.type || "info",
                        is_read: false,
                        created_at: new Date().toISOString(),
                        data: payload.data,
                    });

                    // Optional: Show toast
                }
            });

            return () => {
                unsubscribe();
            };
        }
    }, [user, addNotification, registerToken]);

    return null;
};

export default NotificationHandler;
