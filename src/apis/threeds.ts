import { requester } from '@/lib/requester'

export const getAccounts = async () => {
  const response = await requester.get('/threeds/accounts/')
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

export const getGeneratedPosts = async () => {
  const response = await requester.get('/threeds/posts/')
  return response.data
}

export const getRecommendations = async () => {
  const response = await requester.get('/threeds/recommendations/')
  return response.data
}
