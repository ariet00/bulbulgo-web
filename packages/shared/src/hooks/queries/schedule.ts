'use client'

import { useQuery } from '@tanstack/react-query'

import { getScheduledPosts, type ScheduledPostsQuery } from '../../apis/schedule'

export const SCHEDULE_KEY = ['content-manager', 'schedule'] as const

export const useScheduledPosts = (params?: ScheduledPostsQuery, options?: { refetchInterval?: number }) =>
  useQuery({
    queryKey: [...SCHEDULE_KEY, params],
    queryFn: () => getScheduledPosts(params),
    // Rows in `publishing` flip within seconds; keep the planner fresh.
    refetchInterval: options?.refetchInterval ?? 30_000,
  })
