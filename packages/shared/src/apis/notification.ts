import { requester } from '../lib/requester'
import { Notification } from '../types/notification'


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

/** Ответ браузера на запрос уведомлений → словарь бэкенда
 *  (backend/apps/analytics/subtypes.py). Значение вне словаря отвергается 400.
 *
 *  Через `window.Notification`, а не голый `Notification`: в этом файле уже
 *  импортирован одноимённый ТИП, и голая ссылка резолвится в него, а не в
 *  браузерный глобал. */
export const pushPermissionLabel = (): string => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unknown'
  switch (window.Notification.permission) {
    case 'granted':
      return 'granted'
    case 'denied':
      return 'denied'
    default:
      return 'not_determined'
  }
}

/**
 * Регистрация устройства — с push-токеном или без него.
 *
 * Раньше веб-устройство появлялось в БД, только если пользователь разрешил
 * уведомления и Firebase выдал токен. Из-за этого веб-сессии не с чем было
 * связать: device_info и app_version теперь живут на устройстве, а не в сессии.
 * Поэтому регистрируемся сразу, а токен доезжает этой же функцией, когда его
 * выдаст Firebase.
 *
 * Upsert по X-Device-Id (его шлёт requester) — существующий токен не затирается.
 * Отдельная ручка `/notifications/device-token` (токен обязателен) объявлена
 * deprecated и ждёт ухода старых мобильных сборок — сюда её не тянем.
 */
export const registerDevice = async (
  deviceType: string = 'web',
  pushPermission?: string,
  token?: string,
): Promise<void> => {
  await requester.post('/notifications/device', {
    device_type: deviceType,
    ...(token ? { token } : {}),
    ...(pushPermission ? { push_permission: pushPermission } : {}),
  })
}
