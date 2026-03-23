import { requester } from '@/lib/requester'


export const logout = async () => {
  return requester.post('/auth/logout')
}

export const terminateSession = async (sessionId: number) => {
  const response = await requester.post(`/auth/sessions/${sessionId}/terminate`)
  return response.data
}

export const terminateOtherSessions = async () => {
  const response = await requester.post('/auth/sessions/terminate-others')
  return response.data
}

export const getSessions = async () => {
  const response = await requester.get('/auth/sessions')
  return response.data
}
