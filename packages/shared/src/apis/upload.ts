import { requester } from '../lib/requester';

/**
 * Upload a file to storage.
 *
 * `isPublic=true` returns a permanent public URL (use for content displayed
 * long-term, e.g. ads); the default returns a presigned URL that expires after
 * ~1 hour and suits short-lived/private use.
 */
export const uploadFile = async (
    formData: FormData,
    isPublic = false,
): Promise<{ url: string }> => {
    const response = await requester.post(
        `/upload/${isPublic ? '?is_public=true' : ''}`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
        },
    );
    return response.data;
};
