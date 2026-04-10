import { requester } from '../lib/requester'
import { Notification, DeviceToken } from '../types/notification'


export const getNotifications = async (skip = 0, limit = 100): Promise<Notification[]> => {
  const response = await requester.get('/notifications/', {
    params: { skip, limit },
  })
  return response.data
}

export const getUnreadCount = async (): Promise<number> => {
  const response = await requester.get('/notifications/unread-count')
  return response.data
}

export const markAsRead = async (id: number): Promise<Notification> => {
  const response = await requester.put(`/notifications/${id}/read`)
  return response.data
}

export const markAllAsRead = async (): Promise<Notification[]> => {
  const response = await requester.put('/notifications/read-all')
  return response.data
}

export const registerDeviceToken = async (token: string, deviceType: string): Promise<DeviceToken> => {
  const response = await requester.post('/notifications/device-token', {
    token,
    device_type: deviceType,
  })
  return response.data
}
