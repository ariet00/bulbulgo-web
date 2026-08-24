'use client'

import { useAdminCreateService } from '@/hooks/mutations/admin'
import { Button } from '@doska/ui'
import { Link, useRouter } from '@doska/i18n'
import { ArrowLeft } from 'lucide-react'
import { ServiceForm } from '@/components/admin/services/ServiceForm'

export default function AdminServiceNewPage() {
    const createMutation = useAdminCreateService()
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/services">
                        <ArrowLeft className="size-4 mr-1" /> Назад
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Новый сервис</h1>
            </div>

            <ServiceForm
                submitLabel="Создать"
                submitting={createMutation.isPending}
                onSubmit={(body) =>
                    createMutation.mutate(body, {
                        onSuccess: () => router.push('/admin/services'),
                    })
                }
            />
        </div>
    )
}
