'use client'

import { Button } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ServiceForm } from '@/components/owner/ServiceForm'
import { useCategories } from '@/hooks/queries'

export default function NewServicePage() {
  const router = useRouter()
  const { data: categories } = useCategories(true)

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/owner/services">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Новая услуга</h1>
      </div>
      <ServiceForm categories={categories ?? []} onDone={() => router.push('/owner/services')} />
    </main>
  )
}
