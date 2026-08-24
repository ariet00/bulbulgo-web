import { api } from '@/apis/client'
import type { Task, TaskInput, TaskLogsPage } from '@/types'

export interface TaskFilters {
  project_id?: number
  task_type?: string
  status?: string
}

export async function getTasks(filters: TaskFilters = {}) {
  const { data } = await api.get<Task[]>('/tglab/tasks', { params: filters })
  return data
}

export async function createTask(payload: TaskInput) {
  const { data } = await api.post<Task>('/tglab/tasks', payload)
  return data
}

export async function updateTask(id: number, payload: Partial<TaskInput>) {
  const { data } = await api.patch<Task>(`/tglab/tasks/${id}`, payload)
  return data
}

export async function getTask(id: number) {
  const { data } = await api.get<Task>(`/tglab/tasks/${id}`)
  return data
}

/** Hands the task to the scheduler — the first tick follows within a minute. */
export async function startTask(id: number) {
  const { data } = await api.post<Task>(`/tglab/tasks/${id}/start`)
  return data
}

export async function stopTask(id: number) {
  const { data } = await api.post<Task>(`/tglab/tasks/${id}/stop`)
  return data
}

export async function deleteTask(id: number) {
  const { data } = await api.delete(`/tglab/tasks/${id}`)
  return data
}

/** Tail of the log; new lines arrive over the socket. */
export async function getTaskLogs(id: number, params?: { limit?: number; after_id?: number }) {
  const { data } = await api.get<TaskLogsPage>(`/tglab/tasks/${id}/logs`, { params })
  return data
}
