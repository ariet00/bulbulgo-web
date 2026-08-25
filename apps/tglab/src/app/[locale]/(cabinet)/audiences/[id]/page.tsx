'use client'

import { Button } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import { useParams } from 'next/navigation'

import { AudienceDetail } from '@/components/audiences/AudienceDetail'
import { StatusChip } from '@/components/common/StatusChip'
import { useAudience, useMeta } from '@/hooks/queries'
import { useRouter } from '@/i18n/routing'

export default function AudienceDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params?.id)
  const router = useRouter()
  const { data: audience, isLoading, isError } = useAudience(Number.isFinite(id) ? id : null)
  const { data: meta } = useMeta()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/audiences')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Базы
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {audience?.name ?? 'База'}
          </h1>
          {audience?.collect?.status && (
            <div className="mt-1">
              <StatusChip value={audience.collect.status} options={meta?.task_statuses} />
            </div>
          )}
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Загрузка…</div>}
      {isError && (
        <div className="text-sm text-destructive">
          База не найдена или недоступна.
        </div>
      )}
      {audience && <AudienceDetail audience={audience} />}
    </div>
  )
}
