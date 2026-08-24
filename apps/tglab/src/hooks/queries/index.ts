'use client'

import { useQuery } from '@tanstack/react-query'

import { getMe } from '@/apis/auth'
import { getMeta } from '@/apis/meta'
import { getProjects } from '@/apis/projects'
import { tglabKeys } from '@/hooks/queries/keys'
import { useAuthStore } from '@/store/useAuthStore'

/** The signed-in operator: identity, permissions, quotas. */
export function useMe() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: tglabKeys.me,
    queryFn: getMe,
    enabled: Boolean(token),
    retry: false,
  })
}

/** Dictionaries change only with a deploy — cache them for the session. */
export function useMeta() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: tglabKeys.meta,
    queryFn: getMeta,
    enabled: Boolean(token),
    staleTime: 60 * 60 * 1000,
  })
}

export function useProjects() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: tglabKeys.projects,
    queryFn: getProjects,
    enabled: Boolean(token),
  })
}
