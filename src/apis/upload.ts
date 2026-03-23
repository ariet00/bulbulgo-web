import { requester } from '@/lib/requester';

export const uploadFile = async (formData: FormData): Promise<{ url: string }> => {
    const response = await requester.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
