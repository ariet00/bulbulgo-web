'use client'

import { useQuery } from '@tanstack/react-query'

import {
  getPageInsights,
  getPagePostComments,
  getPagePostInsights,
  getPagePosts,
} from '../../apis/pages'

export const usePagePosts = (accountId: number | null) =>
  useQuery({
    queryKey: ['pages', 'posts', accountId],
    queryFn: () => getPagePosts(accountId!, 25),
    enabled: !!accountId,
  })

export const usePagePostComments = (
  accountId: number | null,
  postId: string | null,
) =>
  useQuery({
    queryKey: ['pages', 'comments', accountId, postId],
    queryFn: () => getPagePostComments(accountId!, postId!),
    enabled: !!accountId && !!postId,
  })

export const usePageInsights = (accountId: number | null) =>
  useQuery({
    queryKey: ['pages', 'insights', accountId],
    queryFn: () => getPageInsights(accountId!),
    enabled: !!accountId,
    staleTime: 60_000,
  })

export const usePagePostInsights = (
  accountId: number | null,
  postId: string | null,
) =>
  useQuery({
    queryKey: ['pages', 'post-insights', accountId, postId],
    queryFn: () => getPagePostInsights(accountId!, postId!),
    enabled: !!accountId && !!postId,
  })
