'use client'

import { useQuery } from '@tanstack/react-query'

import {
  getInstagramAccountInsights,
  getInstagramConversationMessages,
  getInstagramConversations,
  getInstagramMedia,
  getInstagramMediaComments,
  getInstagramMediaInsights,
} from '../../apis/instagram'

export const useInstagramMedia = (accountId: number | null) =>
  useQuery({
    queryKey: ['instagram', 'media', accountId],
    queryFn: () => getInstagramMedia(accountId!, 25),
    enabled: !!accountId,
  })

export const useInstagramMediaComments = (
  accountId: number | null,
  mediaId: string | null,
) =>
  useQuery({
    queryKey: ['instagram', 'comments', accountId, mediaId],
    queryFn: () => getInstagramMediaComments(accountId!, mediaId!),
    enabled: !!accountId && !!mediaId,
  })

export const useInstagramConversations = (accountId: number | null) =>
  useQuery({
    queryKey: ['instagram', 'conversations', accountId],
    queryFn: () => getInstagramConversations(accountId!),
    enabled: !!accountId,
    refetchInterval: 30_000, // polling fallback if webhooks lag
  })

export const useInstagramConversationMessages = (
  accountId: number | null,
  conversationId: number | null,
) =>
  useQuery({
    queryKey: ['instagram', 'conversation', accountId, conversationId],
    queryFn: () =>
      getInstagramConversationMessages(accountId!, conversationId!),
    enabled: !!accountId && !!conversationId,
    refetchInterval: 15_000,
  })

export const useInstagramAccountInsights = (accountId: number | null) =>
  useQuery({
    queryKey: ['instagram', 'insights', accountId],
    queryFn: () => getInstagramAccountInsights(accountId!),
    enabled: !!accountId,
  })

export const useInstagramMediaInsights = (
  accountId: number | null,
  mediaId: string | null,
) =>
  useQuery({
    queryKey: ['instagram', 'media-insights', accountId, mediaId],
    queryFn: () => getInstagramMediaInsights(accountId!, mediaId!),
    enabled: !!accountId && !!mediaId,
  })
