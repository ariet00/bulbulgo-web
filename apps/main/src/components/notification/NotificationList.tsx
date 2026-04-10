"use client";

import React, { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { useLocale } from "next-intl";
import { useNotificationStore } from "@doska/shared"
import { useMarkAsRead, useMarkAllAsRead } from "@doska/shared"
import { ScrollArea } from "@doska/ui"
import { Button } from "@doska/ui"
import { Badge } from "@doska/ui"
import { CheckCheck, Loader2, Bell } from "lucide-react";
import { cn } from "@doska/shared"
import { useNotifications } from "@doska/shared"

const NotificationList = ({ onClose }: { onClose: () => void }) => {
    const locale = useLocale();
    const setNotifications = useNotificationStore(state => state.setNotifications);
    const notifications = useNotificationStore(state => state.notifications);
    const { data, isLoading } = useNotifications()
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

    const handleMarkAsRead = (id: number) => {
        markAsRead(id);
    };

    useEffect(() => {
        if (data) {
            setNotifications(data);
        }
    }, [data, setNotifications]);

    return (
        <div className="absolute right-0 mt-2 w-96 bg-popover text-popover-foreground rounded-xl shadow-2xl overflow-hidden z-50 border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <h3 className="font-semibold">Notifications</h3>
                    {notifications.length > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 h-5 min-w-5 flex items-center justify-center">
                            {notifications.filter(n => !n.is_read).length}
                        </Badge>
                    )}
                </div>
                {notifications.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAllAsRead()}
                        disabled={isMarkingAll}
                        className="text-xs h-8 px-2 text-muted-foreground hover:text-primary"
                    >
                        {isMarkingAll ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCheck className="h-3 w-3 mr-1" />}
                        Mark all read
                    </Button>
                )}
            </div>

            <ScrollArea className="h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mb-2" />
                        <span className="text-sm">Loading...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <Bell className="h-8 w-8 mb-2 opacity-20" />
                        <span className="text-sm">No notifications</span>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                                className={cn(
                                    "p-4 cursor-pointer transition-colors hover:bg-muted/50 relative group",
                                    !notification.is_read ? "bg-primary/5" : "bg-background"
                                )}
                            >
                                <div className="flex justify-between items-start gap-3 mb-1">
                                    <h4 className={cn(
                                        "text-sm font-medium leading-none",
                                        !notification.is_read ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {notification.title}
                                    </h4>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                                        {notification.created_at ? formatDistanceToNow(new Date(notification.created_at), {
                                            addSuffix: true,
                                            locale: locale === "ru" ? ru : enUS,
                                        }) : null}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {notification.body}
                                </p>
                                {!notification.is_read && (
                                    <div className="absolute top-4 right-2 w-2 h-2 rounded-full bg-primary" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};

export default NotificationList;
