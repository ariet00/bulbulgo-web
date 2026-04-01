import { requester } from '@/lib/requester'

export const getAccounts = async () => {
  const response = await requester.get('/threeds/accounts/')
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
