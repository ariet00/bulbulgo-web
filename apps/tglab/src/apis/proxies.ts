import { api } from '@/apis/client'
import type { Proxy, ProxyBulkInput, ProxyBulkResult, ProxyInput } from '@/types'

export async function getProxies(params?: { project_id?: number; status?: string }) {
  const { data } = await api.get<Proxy[]>('/tglab/proxies', { params })
  return data
}

export async function createProxy(payload: ProxyInput) {
  const { data } = await api.post<Proxy>('/tglab/proxies', payload)
  return data
}

export async function createProxiesBulk(payload: ProxyBulkInput) {
  const { data } = await api.post<ProxyBulkResult>('/tglab/proxies/bulk', payload)
  return data
}

export async function updateProxy(id: number, payload: Partial<ProxyInput>) {
  const { data } = await api.patch<Proxy>(`/tglab/proxies/${id}`, payload)
  return data
}

export async function deleteProxy(id: number) {
  const { data } = await api.delete(`/tglab/proxies/${id}`)
  return data
}

/** Connects through the proxy and reads back its exit IP — takes a few seconds. */
export async function checkProxy(id: number) {
  const { data } = await api.post<Proxy>(`/tglab/proxies/${id}/check`)
  return data
}
