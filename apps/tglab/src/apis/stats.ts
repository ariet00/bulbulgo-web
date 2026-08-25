import { api } from '@/apis/client'
import type { StatsOverview, TaskStats } from '@/types'

/** Fleet health + today's actions + a week trend. */
export async function getOverview() {
  const { data } = await api.get<StatsOverview>('/tglab/stats/overview')
  return data
}

/** Per-task breakdown: totals, failure reasons, per account, daily series. */
export async function getTaskStats(taskId: number) {
  const { data } = await api.get<TaskStats>(`/tglab/stats/tasks/${taskId}`)
  return data
}
