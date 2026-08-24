import { api } from '@/apis/client'
import type { TglabSession, TglabUser } from '@/types'

export async function login(payload: { login: string; password: string }) {
  const { data } = await api.post<TglabSession>('/tglab/auth/login', payload)
  return data
}

export async function getMe() {
  const { data } = await api.get<TglabUser>('/tglab/me')
  return data
}

/** Shared endpoint — the cabinet only owns sign-in. */
export async function logout() {
  await api.post('/auth/logout')
}
