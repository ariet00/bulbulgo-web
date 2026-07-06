'use client'

import { useRouter } from 'next/navigation'
import { NewsForm } from '@/components/admin/news/NewsForm'
import { useAdminCreateNews } from '@/hooks/mutations/admin'

export default function AdminNewsCreatePage() {
    const router = useRouter()
    const createNews = useAdminCreateNews()

    return (
        <NewsForm
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
