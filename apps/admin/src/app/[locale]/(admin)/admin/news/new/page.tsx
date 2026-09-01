'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { NewsForm } from '@/components/admin/news/NewsForm'
import { useAdminCreateNews } from '@/hooks/mutations/admin'

export default function AdminNewsCreatePage() {
    const router = useRouter()
    // ?kind=guide — создание гайда обучения (кнопка на табе «Гайды обучения»).
    const kind = useSearchParams().get('kind') === 'guide' ? 'guide' : 'news'
    const createNews = useAdminCreateNews()

    return (
        <NewsForm
            kind={kind}
            saving={createNews.isPending}
            onSubmit={(values) =>
                createNews.mutate(values, {
                    onSuccess: (created) =>
                        router.replace(`/admin/news/${created.id}`),
                })
            }
        />
    )
}
