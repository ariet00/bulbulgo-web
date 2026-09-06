'use client'

import { use, useState } from 'react'
import { Button, Skeleton } from '@doska/ui'
import { useRouter } from '@doska/i18n'
import { ArrowLeft } from 'lucide-react'
import { useAdminUpdateService } from '@/hooks/mutations/admin'
import { useAdminService } from '@/hooks/queries/admin'
import { ServiceForm } from '@/components/admin/services/form/ServiceForm'
import { useConfirm } from '@/components/admin/ConfirmProvider'

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
    const confirm = useConfirm()
    const [dirty, setDirty] = useState(false)

    const goBack = async () => {
        if (dirty && !(await confirm('Уйти без сохранения? Правки потеряются.')))
            return
        router.push('/admin/services')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={goBack}>
                    <ArrowLeft className="size-4 mr-1" /> Назад
                </Button>
                <h1 className="text-2xl font-bold">
                    {service
                        ? `Сервис «${service.label?.ru ?? service.slug}»`
                        : `Сервис #${serviceId}`}
                </h1>
            </div>

            {isLoading || !service ? (
                <div className="space-y-3">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : (
                <ServiceForm
                    initial={service}
                    submitLabel="Сохранить"
                    submitting={updateMutation.isPending}
                    onDirtyChange={setDirty}
                    // slug/type иммутабельны — бэк их в PATCH игнорирует
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
