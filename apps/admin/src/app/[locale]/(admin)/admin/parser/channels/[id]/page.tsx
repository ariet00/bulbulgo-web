'use client'

import { useParserChannel, useUpdateParserChannel } from '@doska/shared'
import { Button } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
    ChannelForm,
    ChannelFormActions,
    channelFromRow,
    channelToBody,
    emptyChannel,
} from '@/components/admin/parser/ChannelForm'

export default function EditParserChannelPage() {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const channelId = Number(params.id)

    const { data: channel, isLoading } = useParserChannel(channelId)
    const update = useUpdateParserChannel()

    const [state, setState] = useState(emptyChannel)
    useEffect(() => {
        if (channel) setState(channelFromRow(channel))
    }, [channel])

    if (isLoading || !channel) return <div>Loading…</div>

    const save = async () => {
        let body
        try {
            body = channelToBody(state)
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Ошибка в форме')
            return
        }
        await update.mutateAsync({ id: channelId, body })
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
                <Link href="/admin/parser/channels">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="size-4 mr-1" /> К списку
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">
                    Канал: <span className="font-mono">{channel.chat_id}</span>
                </h1>
            </div>

            <ChannelForm value={state} onChange={setState} />

            <ChannelFormActions
                onSave={save}
                onCancel={() => router.push('/admin/parser/channels')}
                saveLabel="Сохранить"
                saving={update.isPending}
            />
        </div>
    )
}
