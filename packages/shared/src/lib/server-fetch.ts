import { authOptions } from '../lib/auth'
import { getServerSession } from 'next-auth'


export const serverFetch = async (endpoint: string, options: RequestInit & { refreshToken?: string } = {}) => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const url = endpoint.startsWith('http') ? endpoint : `${baseURL}${endpoint}`;
    const session = await getServerSession(authOptions)

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if ((session as any)?.accessToken) {
        (headers as any)['Authorization'] = `Bearer ${(session as any).accessToken}`;
    }

    let response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401 && options.refreshToken) {
        try {
            const refreshUrl = `${baseURL}/auth/refresh-token?refresh_token=${options.refreshToken}`;
            const refreshResponse = await fetch(refreshUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                const newAccessToken = data.access_token;

                // Retry original request with new token
                const newHeaders = {
                    ...headers,
                    'Authorization': `Bearer ${newAccessToken}`,
                };

                response = await fetch(url, {
                    ...options,
                    headers: newHeaders,
                });
            }
        } catch (error) {
            console.error('Server fetch refresh failed', error);
        }
    }

    return response.json();
};
