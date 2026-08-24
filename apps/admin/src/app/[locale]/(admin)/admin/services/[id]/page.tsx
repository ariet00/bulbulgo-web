'use client'

import { use } from 'react'
import { useAdminUpdateService } from '@/hooks/mutations/admin'
import { useAdminService } from '@/hooks/queries/admin'
import { Button } from '@doska/ui'
import { Link, useRouter } from '@doska/i18n'
import { ArrowLeft } from 'lucide-react'
import { ServiceForm } from '@/components/admin/services/ServiceForm'

export default function AdminServiceEditPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const serviceId = Number(id)

    const { data: service, isLoading } = useAdminService(serviceId)
    const updateMutation = useAdminUpdateService()
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/services">
                        <ArrowLeft className="size-4 mr-1" /> Назад
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">
                    {service
                        ? `Сервис «${service.label?.ru ?? service.slug}»`
                        : `Сервис #${serviceId}`}
                </h1>
            </div>

            {isLoading || !service ? (
                <div>Загрузка…</div>
            ) : (
                <ServiceForm
                    initial={service}
                    submitLabel="Сохранить"
                    submitting={updateMutation.isPending}
                    onSubmit={({ slug: _slug, type: _type, ...body }) =>
                        updateMutation.mutate(
                            { id: serviceId, body },
                            { onSuccess: () => router.push('/admin/services') },
                        )
                    }
                />
            )}
        </div>
    )
}
