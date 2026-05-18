'use client'

import { useQuery } from '@tanstack/react-query'

import {
  getWhatsAppAnalytics,
  getWhatsAppConfig,
  getWhatsAppConversations,
  getWhatsAppMessages,
  getWhatsAppTemplates,
} from '../../apis/whatsapp'

export const useWhatsAppConfig = () =>
  useQuery({
    queryKey: ['whatsapp', 'config'],
    queryFn: getWhatsAppConfig,
    staleTime: 60_000,
  })

export const useWhatsAppConversations = (accountId: number | null) =>
  useQuery({
    queryKey: ['whatsapp', 'conversations', accountId],
    queryFn: () => getWhatsAppConversations(accountId!),
    enabled: !!accountId,
    refetchInterval: 30_000,
  })

export const useWhatsAppMessages = (
  accountId: number | null,
  conversationId: number | null,
) =>
  useQuery({
    queryKey: ['whatsapp', 'messages', accountId, conversationId],
    queryFn: () => getWhatsAppMessages(accountId!, conversationId!),
    enabled: !!accountId && !!conversationId,
    refetchInterval: 15_000,
  })

export const useWhatsAppTemplates = (accountId: number | null) =>
  useQuery({
    queryKey: ['whatsapp', 'templates', accountId],
    queryFn: () => getWhatsAppTemplates(accountId!),
    enabled: !!accountId,
  })

export const useWhatsAppAnalytics = (accountId: number | null, days = 30) =>
  useQuery({
    queryKey: ['whatsapp', 'analytics', accountId, days],
    queryFn: () => getWhatsAppAnalytics(accountId!, days),
    enabled: !!accountId,
    staleTime: 60_000,
  })
