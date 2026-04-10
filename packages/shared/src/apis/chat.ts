import { requester } from '../lib/requester'
import {
  Chat,
  CreateChatRequest,
  Message,
  SendMessageRequest,
} from '../types/chat'


export const chatApi = {
  createChat: async (data: CreateChatRequest): Promise<Chat> => {
    const response = await requester.post('/chats/', data)
    return response.data
  },

  getChats: async (skip = 0, limit = 20, category?: string): Promise<Chat[]> => {
    const response = await requester.get('/chats/', { params: { skip, limit, category } })
    return response.data
  },

  getChat: async (id: number): Promise<Chat> => {
    const response = await requester.get(`/chats/${id}`)
    return response.data
  },

  getMessages: async (chatId: number, skip = 0, limit = 20): Promise<Message[]> => {
    const response = await requester.get(`/chats/${chatId}/messages`,
      { params: { skip, limit } })
    return response.data
  },

  sendMessage: async (chatId: number, data: SendMessageRequest): Promise<Message> => {
    const response = await requester.post(`/chats/${chatId}/messages`, data)
    return response.data
  },

  markAsRead: async (chatId: number): Promise<void> => {
    await requester.post(`/chats/${chatId}/read`)
  },

}
