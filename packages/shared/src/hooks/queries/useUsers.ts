import { useQuery } from '@tanstack/react-query';
import { getMe, getUserPublic } from '../../apis/users';
import { useUserStore } from '../../store/useUserStore';

export const useGetMe = () => {
    const { setUser, clearUser } = useUserStore();

    return useQuery({
        queryKey: ['user', 'me'],
        queryFn: async () => {
            try {
                const user = await getMe();
                setUser(user);
                return user;
            } catch (error) {
                clearUser();
                throw error;
            }
        },
        retry: false,
        staleTime: Infinity, // Only fetch once per session unless invalidated
        gcTime: Infinity, // Keep in cache
    });
};

export const useGetUserPublic = (id: string) => {
    return useQuery({
        queryKey: ['user', 'public', id],
        queryFn: () => getUserPublic(id),
        enabled: !!id,
    });
};
