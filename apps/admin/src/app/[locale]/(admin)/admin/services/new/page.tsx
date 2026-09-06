'use client'

import { useState } from 'react'
import { Button } from '@doska/ui'
import { useRouter } from '@doska/i18n'
import { ArrowLeft } from 'lucide-react'
import { useAdminCreateService } from '@/hooks/mutations/admin'
import { ServiceForm } from '@/components/admin/services/form/ServiceForm'
import { useConfirm } from '@/components/admin/ConfirmProvider'

export default function AdminServiceNewPage() {
    const createMutation = useAdminCreateService()
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
                <h1 className="text-2xl font-bold">Новый сервис</h1>
            </div>

            <ServiceForm
                submitLabel="Создать"
                submitting={createMutation.isPending}
                onDirtyChange={setDirty}
                onSubmit={(body) =>
                    createMutation.mutate(body, {
                        onSuccess: () => router.push('/admin/services'),
                    })
                }
            />
        </div>
    )
}
