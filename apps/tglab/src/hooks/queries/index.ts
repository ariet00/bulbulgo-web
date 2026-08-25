'use client'

import { useQuery } from '@tanstack/react-query'

import type { AccountFilters } from '@/apis/accounts'
import { getAccountSessions, getAccounts } from '@/apis/accounts'
import type { ItemFilters } from '@/apis/audiences'
import { getAudienceItems, getAudienceReach, getAudiences } from '@/apis/audiences'
import { getMe } from '@/apis/auth'
import type { TaskFilters } from '@/apis/tasks'
import { getTaskLogs, getTasks } from '@/apis/tasks'
import { getMeta } from '@/apis/meta'
import { getProjects } from '@/apis/projects'
import { getProxies } from '@/apis/proxies'
import { getOverview, getTaskStats } from '@/apis/stats'
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

export function useProxies(params?: { project_id?: number; status?: string }) {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: [...tglabKeys.proxies, params ?? {}],
    queryFn: () => getProxies(params),
    enabled: Boolean(token),
  })
}

export function useAccounts(filters: AccountFilters = {}) {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: tglabKeys.accountsList(filters),
    queryFn: () => getAccounts(filters),
    enabled: Boolean(token),
    placeholderData: (previous) => previous,
  })
}

/** Other devices logged into the account — a live Telegram call, so it is only
 *  fetched when the panel asking for it is open. */
export function useAccountSessions(accountId: number | null) {
  return useQuery({
    queryKey: tglabKeys.accountSessions(accountId ?? 0),
    queryFn: () => getAccountSessions(accountId as number),
    enabled: Boolean(accountId),
    retry: false,
    staleTime: 0,
  })
}

/** Bases of the operator. While a collection is running the list polls itself —
 *  progress lives on the base, and the live socket only lands in stage 3. */
export function useAudiences(params?: { project_id?: number }) {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: [...tglabKeys.audiences, params ?? {}],
    queryFn: () => getAudiences(params),
    enabled: Boolean(token),
    refetchInterval: (query) => {
      const running = (query.state.data ?? []).some((audience) =>
        ['scheduled', 'running'].includes(audience.collect?.status ?? ''),
      )
      return running ? 3000 : false
    },
  })
}

export function useAudienceItems(audienceId: number | null, filters: ItemFilters = {}) {
  return useQuery({
    queryKey: tglabKeys.audienceItems(audienceId ?? 0, filters),
    queryFn: () => getAudienceItems(audienceId as number, filters),
    enabled: Boolean(audienceId),
    placeholderData: (previous) => previous,
  })
}

export function useTasks(filters: TaskFilters = {}) {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: [...tglabKeys.tasks, filters],
    queryFn: () => getTasks(filters),
    enabled: Boolean(token),
    placeholderData: (previous) => previous,
  })
}

/** Tail of a task's log — the panel seeds itself from this, then the socket
 *  keeps appending. */
export function useTaskLogs(taskId: number | null) {
  return useQuery({
    queryKey: tglabKeys.taskLogs(taskId ?? 0),
    queryFn: () => getTaskLogs(taskId as number, { limit: 200 }),
    enabled: Boolean(taskId),
    staleTime: 0,
  })
}

/** Per-account coverage of a base — the answer to «почему никого не приглашает». */
export function useAudienceReach(audienceId: number | null) {
  return useQuery({
    queryKey: tglabKeys.audienceReach(audienceId ?? 0),
    queryFn: () => getAudienceReach(audienceId as number),
    enabled: Boolean(audienceId),
  })
}

/** Dashboard summary — fleet health, today's actions, a week trend. Refreshes
 *  itself while the tab is open so a running task's numbers keep moving. */
export function useStatsOverview() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: tglabKeys.statsOverview,
    queryFn: getOverview,
    enabled: Boolean(token),
    refetchInterval: 30_000,
  })
}

/** Per-task breakdown behind the log — only fetched while its panel is open. */
export function useTaskStats(taskId: number | null) {
  return useQuery({
    queryKey: tglabKeys.taskStats(taskId ?? 0),
    queryFn: () => getTaskStats(taskId as number),
    enabled: Boolean(taskId),
    refetchInterval: 30_000,
  })
}
