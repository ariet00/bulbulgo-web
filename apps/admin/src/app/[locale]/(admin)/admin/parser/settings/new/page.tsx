'use client'

import { useCreateParserSetting } from '@doska/shared'
import { Button } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import {
    emptySetting,
    SettingForm,
    SettingFormActions,
    validateSetting,
} from '@/components/admin/parser/SettingForm'

export default function NewParserSettingPage() {
    const router = useRouter()
    const params = useSearchParams()
    const create = useCreateParserSetting()
    const [state, setState] = useState({
        ...emptySetting,
        group: params?.get('group') ?? '',
    })
    const [error, setError] = useState<string | null>(null)

    const save = async () => {
        const v = validateSetting(state)
        if (!v.ok) {
            setError(v.error)
            return
        }
        await create.mutateAsync(v.body)
        router.push('/admin/parser/settings')
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <Link href="/admin/parser/settings">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="size-4 mr-1" /> К списку
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Новая настройка</h1>
            </div>

            <SettingForm
                value={state}
                onChange={setState}
                error={error}
                onClearError={() => setError(null)}
            />

            <SettingFormActions
                onSave={save}
                onCancel={() => router.push('/admin/parser/settings')}
                saveLabel="Создать"
                saving={create.isPending}
            />
        </div>
    )
}
