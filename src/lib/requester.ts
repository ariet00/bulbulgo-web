import { authOptions } from '@/lib/auth'
import axios from 'axios'
import { useToastStore } from '@/store/useToastStore'
import { useUserStore } from '@/store/useUserStore'
import { getServerSession } from 'next-auth'

const baseURL = process.env.NEXT_PUBLIC_API_URL

const requester = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

requester.interceptors.request.use(
    async (config) => {
        if (typeof window !== 'undefined') {
            const token = useUserStore.getState().token
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        } else {
            const session = await getServerSession(authOptions)
            const authorization = session?.accessToken
            if (authorization) {
                config.headers.Authorization = `Bearer ${authorization}`
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })

    failedQueue = []
}
// TODO для серверных запросов нужно отдельный враппер
requester.interceptors.response.use(
    (response) => response,
    async (error) => {
        const addMessage = useToastStore.getState().addMessage
        const originalRequest = error.config
        const isClient = typeof window !== 'undefined'
        const is401 = error.response?.status === 401
        if (is401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                })

                    .then((token) => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token
                        return requester(originalRequest)
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = useUserStore.getState().refreshToken

            if (!refreshToken) {
                useUserStore.getState().clearUser()
                if (isClient) {
                    window.location.href = `/login?redirect=${encodeURIComponent(
                        window.location.pathname)}`
                }
                return Promise.reject(error)
            }

            try {
                // Call refresh endpoint
                // Note: Using axios directly to avoid interceptors loop
                const response = await axios.post(`${baseURL}/auth/refresh-token`, null,
                    {
                        params: { refresh_token: refreshToken },
                    })

                const { access_token, refresh_token } = response.data

                useUserStore.getState().setToken(access_token)
                if (refresh_token) {
                    useUserStore.getState().setRefreshToken(refresh_token)
                }

                requester.defaults.headers.common['Authorization'] = 'Bearer ' + access_token
                originalRequest.headers['Authorization'] = 'Bearer ' + access_token

                processQueue(null, access_token)
                return requester(originalRequest)
            } catch (err) {
                processQueue(err, null)
                useUserStore.getState().clearUser()
                if (isClient) {
                    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
                }
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }

        const message = error.response?.data?.detail || error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred'
        // Only show notification if it's not a 401 that we handled (or tried to handle)
        // Or if we want to show session expired message
        if (!is401 && isClient) {
            addMessage({
                type: 'error',
                message: message,
                duration: 5000,
            })
        }

        return Promise.reject(error)
    },
)

export { requester }