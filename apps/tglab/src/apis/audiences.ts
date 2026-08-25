import { api } from '@/apis/client'
import type {
  Audience,
  AudienceCollectInput,
  AudienceImportResult,
  AudienceInput,
  AudienceItemsPage,
  AudienceReach,
  AudienceRecollectInput,
} from '@/types'

export interface ItemFilters {
  page?: number
  size?: number
  /** bitmask: keep entries carrying any of these flags */
  has_flags?: number
  /** bitmask: keep entries carrying none of these */
  without_flags?: number
}

export async function getAudiences(params?: { project_id?: number }) {
  const { data } = await api.get<Audience[]>('/tglab/audiences', { params })
  return data
}

export async function getAudience(id: number) {
  const { data } = await api.get<Audience>(`/tglab/audiences/${id}`)
  return data
}

export async function createAudience(payload: AudienceInput) {
  const { data } = await api.post<Audience>('/tglab/audiences', payload)
  return data
}

/** Starts a `parsing` task on the tglab worker; poll the base for progress. */
export async function collectAudience(payload: AudienceCollectInput) {
  const { data } = await api.post<Audience>('/tglab/audiences/collect', payload)
  return data
}

export async function stopCollection(id: number) {
  const { data } = await api.post<Audience>(`/tglab/audiences/${id}/collect/stop`)
  return data
}

/** Re-run collection over a base's stored groups — picks up newcomers. */
export async function recollectAudience(id: number, payload: AudienceRecollectInput) {
  const { data } = await api.post<Audience>(`/tglab/audiences/${id}/recollect`, payload)
  return data
}

export async function updateAudience(id: number, payload: Partial<AudienceInput>) {
  const { data } = await api.patch<Audience>(`/tglab/audiences/${id}`, payload)
  return data
}

export async function deleteAudience(id: number) {
  const { data } = await api.delete(`/tglab/audiences/${id}`)
  return data
}

/** Whose base this is — which accounts can address how much of it. */
export async function getAudienceReach(id: number) {
  const { data } = await api.get<AudienceReach>(`/tglab/audiences/${id}/reach`)
  return data
}

export async function getAudienceItems(id: number, filters: ItemFilters = {}) {
  const { data } = await api.get<AudienceItemsPage>(`/tglab/audiences/${id}/items`, {
    params: filters,
  })
  return data
}

export async function addAudienceItems(id: number, raw: string) {
  const { data } = await api.post<AudienceImportResult>(
    `/tglab/audiences/${id}/items`,
    { raw },
  )
  return data
}

export async function uploadAudienceItems(id: number, file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<AudienceImportResult>(
    `/tglab/audiences/${id}/upload`,
    form,
  )
  return data
}

/** Downloads the base as a file, client-side (the endpoint sets the filename). */
export async function exportAudience(
  id: number,
  format: 'txt' | 'csv',
  filters: ItemFilters = {},
) {
  const { data } = await api.get(`/tglab/audiences/${id}/export`, {
    params: { format, ...filters },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `audience-${id}.${format}`
  link.click()
  URL.revokeObjectURL(url)
}
