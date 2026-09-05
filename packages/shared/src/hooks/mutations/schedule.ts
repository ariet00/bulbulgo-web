'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  cancelScheduledPost,
  createScheduledPost,
  deleteScheduledPost,
  publishScheduledPostNow,
  updateScheduledPost,
  type ScheduledPostCreateBody,
  type ScheduledPostUpdateBody,
} from '../../apis/schedule'
import { SCHEDULE_KEY } from '../queries/schedule'

const describe = (e: any, fallback: string) => e?.response?.data?.message || fallback

export const useCreateScheduledPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ScheduledPostCreateBody) => createScheduledPost(body),
    onSuccess: () => {
      toast.success('Пост запланирован')
      qc.invalidateQueries({ queryKey: SCHEDULE_KEY })
    },
    onError: (e: any) => toast.error(describe(e, 'Не удалось запланировать пост')),
  })
}

export const useUpdateScheduledPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ScheduledPostUpdateBody }) => updateScheduledPost(id, body),
    onSuccess: () => {
      toast.success('Изменения сохранены')
      qc.invalidateQueries({ queryKey: SCHEDULE_KEY })
    },
    onError: (e: any) => toast.error(describe(e, 'Не удалось сохранить изменения')),
  })
}

export const useCancelScheduledPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelScheduledPost(id),
    onSuccess: () => {
      toast.success('Публикация отменена')
      qc.invalidateQueries({ queryKey: SCHEDULE_KEY })
    },
    onError: (e: any) => toast.error(describe(e, 'Не удалось отменить публикацию')),
  })
}

export const usePublishScheduledPostNow = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => publishScheduledPostNow(id),
    onSuccess: () => {
      toast.success('Отправлено на публикацию')
      qc.invalidateQueries({ queryKey: SCHEDULE_KEY })
    },
    onError: (e: any) => toast.error(describe(e, 'Не удалось опубликовать')),
  })
}

export const useDeleteScheduledPost = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteScheduledPost(id),
    onSuccess: () => {
      toast.success('Удалено из планировщика')
      qc.invalidateQueries({ queryKey: SCHEDULE_KEY })
    },
    onError: (e: any) => toast.error(describe(e, 'Не удалось удалить')),
  })
}
