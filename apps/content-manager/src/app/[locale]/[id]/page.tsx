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

export default function AccountDetailPage() {
  const params = useParams()
  const accountId = parseInt(params.id as string)
  const { data: account, isLoading } = useContentAccount(accountId)

  if (isLoading || !account) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> К списку
      </Link>

      {account.platform === 'threads' ? (
        <ThreadsAccountDetail account={account as ContentAccount} />
      ) : (
        <GenericAccountDetail account={account as ContentAccount} />
      )}
    </div>
  )
}
