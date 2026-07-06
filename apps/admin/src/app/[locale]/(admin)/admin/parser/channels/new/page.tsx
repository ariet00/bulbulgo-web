'use client'

import { useCreateParserChannel } from '@doska/shared'
import { Button } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import {
    ChannelForm,
    ChannelFormActions,
    channelToBody,
    emptyChannel,
} from '@/components/admin/parser/ChannelForm'

export default function NewParserChannelPage() {
    const router = useRouter()
    const create = useCreateParserChannel()
    const [state, setState] = useState(emptyChannel)

    const save = async () => {
        if (!state.chat_id.trim()) return
        let body
        try {
            body = channelToBody(state)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Ошибка в форме')
            return
        }
        await create.mutateAsync(body)
        router.push('/admin/parser/channels')
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
                <Link href="/admin/parser/channels">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="size-4 mr-1" /> К списку
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Новый канал</h1>
            </div>

            <ChannelForm value={state} onChange={setState} />

            <ChannelFormActions
                onSave={save}
                onCancel={() => router.push('/admin/parser/channels')}
                saveLabel="Создать"
                saving={create.isPending}
            />
        </div>
    )
}
