'use client'

import { Button } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { CategoryForm } from '@/components/owner/CategoryForm'

export default function NewCategoryPage() {
  const router = useRouter()
  return (
    <main className="mx-auto max-w-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/owner/services">
          <Button variant="ghost" size="sm" className="px-2">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Новая категория</h1>
      </div>
      <CategoryForm onDone={() => router.push('/owner/services')} />
    </main>
  )
}
