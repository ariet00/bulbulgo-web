'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@doska/ui'
import { NewsForm } from '@/components/admin/news/NewsForm'
import { useAdminNews } from '@/hooks/queries/admin'
import { useAdminUpdateNews } from '@/hooks/mutations/admin'

export default function AdminNewsEditPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const newsId = Number(id)
    const { data: news, isLoading } = useAdminNews(newsId)
    const updateNews = useAdminUpdateNews()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/admin/news">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Новости
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Новость #{id}</h1>
            </div>
            {isLoading && <div>Загрузка...</div>}
            {news && (
                <NewsForm
                    initial={news}
                    saving={updateNews.isPending}
                    onSubmit={(values) =>
                        updateNews.mutate({ id: newsId, ...values })
                    }
                />
            )}
        </div>
    )
}
