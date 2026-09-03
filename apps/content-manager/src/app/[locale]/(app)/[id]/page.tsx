'use client'

import React from 'react'

import { useParams } from 'next/navigation'

import {
  useContentAccount,
  type ContentAccount,
} from '@doska/shared'
import { Link } from '@doska/i18n'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { ThreadsAccountDetail } from '@/components/threads/ThreadsAccountDetail'
import { GenericAccountDetail } from '@/components/GenericAccountDetail'
import { InstagramAccountDetail } from '@/components/instagram/InstagramAccountDetail'
import { WhatsAppAccountDetail } from '@/components/whatsapp/WhatsAppAccountDetail'
import { PagesAccountDetail } from '@/components/pages/PagesAccountDetail'

export default function AccountDetailPage() {
  const params = useParams()
  const accountId = parseInt(params.id as string)
  const { data: account, isLoading } = useContentAccount(accountId)

  if (isLoading || !account) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" /> Аккаунты
      </Link>

      {account.platform === 'threads' ? (
        <ThreadsAccountDetail account={account as ContentAccount} />
      ) : account.platform === 'instagram' ? (
        <InstagramAccountDetail account={account as ContentAccount} />
      ) : account.platform === 'whatsapp' ? (
        <WhatsAppAccountDetail account={account as ContentAccount} />
      ) : account.platform === 'pages' ? (
        <PagesAccountDetail account={account as ContentAccount} />
      ) : (
        <GenericAccountDetail account={account as ContentAccount} />
      )}
    </div>
  )
}
