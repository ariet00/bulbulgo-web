import { api } from '@/apis/client'
import type { Project, ProjectInput } from '@/types'

export async function getProjects() {
  const { data } = await api.get<Project[]>('/tglab/projects')
  return data
}

export async function createProject(payload: ProjectInput) {
  const { data } = await api.post<Project>('/tglab/projects', payload)
  return data
}

export async function updateProject(id: number, payload: Partial<ProjectInput>) {
  const { data } = await api.patch<Project>(`/tglab/projects/${id}`, payload)
  return data
}

export async function deleteProject(id: number) {
  const { data } = await api.delete(`/tglab/projects/${id}`)
  return data
}
