"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@doska/shared"
import { useUserStore } from "@doska/shared"

import { useNotifications, useUnreadCount } from "@doska/shared"
import { registerDevice, pushPermissionLabel } from "../../apis/notification"

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

    // Регистрируем устройство ДО и НЕЗАВИСИМО от разрешения на пуш и от логина.
    // Без этого веб-устройство попадало в БД, только когда Firebase выдал токен,
    // и веб-сессию не с чем было связать: device_info / app_version теперь живут
    // на устройстве, а не в сессии.
    //
    // Один upsert по X-Device-Id (его шлёт requester). Событие пишет бэкенд и
    // только при изменении, поэтому дедупить на клиенте нечего.
    useEffect(() => {
        registerDevice("web", pushPermissionLabel()).catch(() => {
            // Не критично: повторится при следующей загрузке страницы.
        });
    }, []);

    useEffect(() => {
        if (isGuest || !user) return;

        let unsubscribe: (() => void) | undefined;

        // Request permission and get token
        const setupMessaging = async () => {
            try {
                // Lazy-load Firebase so its ~39MB module graph stays out of the
                // static bundle/dev-compiler graph of every page that touches @doska/shared.
                const [{ getMessagingInstance }, { onMessage, getToken }] = await Promise.all([
                    import("../../lib/firebase"),
                    import("firebase/messaging"),
                ]);

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
