'use client'

import { useAdminCreateAd } from '@/hooks/mutations/admin'
import { Button } from '@doska/ui'
import { Link, useRouter } from '@doska/i18n'
import { ArrowLeft } from 'lucide-react'
import { AdForm } from '@/components/admin/ads/AdForm'

export default function AdminAdNewPage() {
    const createMutation = useAdminCreateAd()
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/ads">
                        <ArrowLeft className="size-4 mr-1" /> Назад
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Новая реклама</h1>
            </div>

            <AdForm
                submitLabel="Создать"
                submitting={createMutation.isPending}
                onSubmit={(body) =>
                    createMutation.mutate(body, {
                        onSuccess: () => router.push('/admin/ads'),
                    })
                }
            />
        </div>
    )
}
