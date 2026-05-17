'use client'

import { Button, Skeleton } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ServiceForm } from '@/components/owner/ServiceForm'
import { useCategories, useServices } from '@/hooks/queries'

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const serviceId = Number(params.id)

  const { data: services, isLoading } = useServices({ include_inactive: true })
  const { data: categories } = useCategories(true)
  const service = services?.find((s) => s.id === serviceId) ?? null

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/owner/services">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Редактировать услугу</h1>
      </div>

      {isLoading && !services ? (
        <Skeleton className="h-80 w-full" />
      ) : !service ? (
        <p className="text-sm text-muted-foreground">Услуга не найдена.</p>
      ) : (
        <ServiceForm
          service={service}
          categories={categories ?? []}
          onDone={() => router.push('/owner/services')}
        />
      )}
    </main>
  )
}
