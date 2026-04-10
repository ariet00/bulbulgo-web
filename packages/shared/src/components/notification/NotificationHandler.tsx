"use client";

import { useEffect } from "react";
import { onMessage, getToken } from "firebase/messaging";
import { getMessagingInstance } from "@doska/shared"
import { useNotificationStore } from "@doska/shared"
import { useUserStore } from "@doska/shared"

import { useNotifications, useUnreadCount } from "@doska/shared"

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

        let unsubscribe: (() => void) | undefined;

        // Request permission and get token
        const setupMessaging = async () => {
            try {
                const messaging = await getMessagingInstance();
                if (!messaging) {
                    console.warn("Firebase Messaging is not supported in this browser.");
                    return;
                }

                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    const token = await getToken(messaging, {
                        vapidKey: "BL-eR0WrwwwrcYnQvuHdG5hKcEMiwqcmF6UIzNCmvoPccMmJHYnlKHRgX-x7JroINWryCZ6GELSFCBgV-5fYeRU", // TODO: Replace with your VAPID key
                    });
                    if (token) {
                        await registerToken(token);
                    }
                }

                // Listen for foreground messages
                unsubscribe = onMessage(messaging, (payload) => {
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
                    }
                });
            } catch (error) {
                console.error("An error occurred while setting up Firebase Messaging: ", error);
            }
        };

        setupMessaging();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user, isGuest, addNotification, registerToken]);

    return null;
};

export default NotificationHandler;
