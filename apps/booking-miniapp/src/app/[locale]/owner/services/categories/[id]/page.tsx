'use client'

import { Button, Skeleton } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { CategoryForm } from '@/components/owner/CategoryForm'
import { useCategories } from '@/hooks/queries'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const categoryId = Number(params.id)

  const { data: categories, isLoading } = useCategories(true)
  const category = categories?.find((c) => c.id === categoryId) ?? null

  return (
    <main className="mx-auto max-w-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/owner/services">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Редактировать категорию</h1>
      </div>

      {isLoading && !categories ? (
        <Skeleton className="h-40 w-full" />
      ) : !category ? (
        <p className="text-sm text-muted-foreground">Категория не найдена.</p>
      ) : (
        <CategoryForm category={category} onDone={() => router.push('/owner/services')} />
      )}
    </main>
  )
}
