import { useQuery } from '@tanstack/react-query';
import { getNotifications, getUnreadCount } from '@/apis/notification';

export const useNotifications = (skip = 0, limit = 100) => {
    return useQuery({
        queryKey: ['notifications', skip, limit],
        queryFn: () => getNotifications(skip, limit),
    });
};

export const useUnreadCount = (enabled = true) => {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: getUnreadCount,
        enabled
        // refetchInterval: 30000, // Refetch every 30 seconds
    });
};
