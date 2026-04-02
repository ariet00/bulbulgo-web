import { requester } from '@/lib/requester'

export const getAccounts = async () => {
  const response = await requester.get('/threeds/accounts/')
  return response.data
}

export const getAccount = async (accountId: number) => {
  const response = await requester.get(`/threeds/accounts/${accountId}`)
  return response.data
}

export const createAccount = async (data: any) => {
  const response = await requester.post('/threeds/accounts/', data)
  return response.data
}

export const getAccountStatus = async (accountId: number) => {
  const response = await requester.get(`/threeds/accounts/${accountId}/status`)
  return response.data
}

export const submitAccount2FA = async (accountId: number, code: string) => {
  const response = await requester.post(`/threeds/accounts/${accountId}/submit-2fa`, { code })
  return response.data
}

export const getGeneratedPosts = async (params?: { account_id?: number, skip?: number, limit?: number }) => {
  const response = await requester.get('/threeds/posts/', { params })
  return response.data
}

export const getRecommendations = async (params?: { account_id?: number, skip?: number, limit?: number }) => {
  const response = await requester.get('/threeds/recommendations/', { params })
  return response.data
}

export const collectAccountData = async (accountId: number) => {
  const response = await requester.post(`/threeds/accounts/${accountId}/collect`)
  return response.data
}

export const generateDrafts = async (accountId: number) => {
  const response = await requester.post(`/threeds/accounts/${accountId}/generate`)
  return response.data
}

export const updateAccount = async (accountId: number, data: any) => {
  const response = await requester.patch(`/threeds/accounts/${accountId}`, data)
  return response.data
}
