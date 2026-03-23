import { requester } from '@/lib/requester';
import { User, UserPublic } from '@/types';

export const getUserPublic = async (id: string): Promise<UserPublic> => {
    const response = await requester.get(`/users/${id}/public`);
    return response.data;
};

export const getMe = async (): Promise<User> => {
    const response = await requester.get('/users/me');
    return response.data;
};

export const updateMe = async (data: Partial<User>): Promise<User> => {
    const response = await requester.put('/users/me', data);
    return response.data;
};
