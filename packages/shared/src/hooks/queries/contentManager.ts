'use client'

import { useQuery } from '@tanstack/react-query'

import {
  getContentAccount,
  getContentAccounts,
  type Platform,
} from '../../apis/contentManager'

export const useContentAccounts = (platform?: Platform) => {
  return useQuery({
    queryKey: ['content-manager', 'accounts', platform ?? 'all'],
    queryFn: () => getContentAccounts(platform),
  })
}

export const useContentAccount = (accountId: number) => {
  return useQuery({
    queryKey: ['content-manager', 'account', accountId],
    queryFn: () => getContentAccount(accountId),
    enabled: !!accountId,
  })
}
