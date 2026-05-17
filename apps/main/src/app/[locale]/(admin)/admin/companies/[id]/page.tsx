'use client'

import {
    useAdminBookingBots,
    useAdminCompany,
    useAdminUpdateCompany,
} from '@doska/shared'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Textarea,
} from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
    CompanyStatusSelect,
    CompanyTypeSelect,
} from '@/components/admin/selectors/StaticSelects'
import { UserCombobox } from '@/components/admin/selectors/UserCombobox'

export default function EditCompanyPage() {
    const params = useParams<{ id: string }>()
    const companyId = Number(params.id)
    const { data: company, isLoading } = useAdminCompany(companyId)
    const update = useAdminUpdateCompany()
    const { data: allBots } = useAdminBookingBots(false)

    const [ownerId, setOwnerId] = useState<number | null>(null)
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [type, setType] = useState<string>('')
    const [status, setStatus] = useState<string>('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        if (!company) return
        setOwnerId(company.owner_id ?? null)
        setName(company.name ?? '')
        setSlug(company.slug ?? '')
        setType(company.type ?? '')
        setStatus(company.status ?? '')
        setDescription(company.description ?? '')
    }, [company])

    if (isLoading || !company) return <div>Loading...</div>

    const save = async () => {
        const body: any = {}
        if (ownerId && ownerId !== company.owner_id) body.owner_user_id = ownerId
        if (name !== company.name) body.name = name
        if (slug !== company.slug) body.slug = slug
        if (type !== company.type) body.type = type
        if (status !== company.status) body.status = status
        if ((description || '') !== (company.description || '')) body.description = description
        if (Object.keys(body).length === 0) return
        await update.mutateAsync({ id: companyId, body })
    }

    const linkedBots = (allBots ?? []).filter((b) => b.company_id === companyId)

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <Link href="/admin/companies">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="size-4 mr-1" /> К списку
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{company.name}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Основное</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Название</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Slug</Label>
                        <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Тип</Label>
                            <CompanyTypeSelect value={type} onChange={setType} />
                        </div>
                        <div>
                            <Label>Статус</Label>
                            <CompanyStatusSelect value={status} onChange={setStatus} />
                        </div>
                    </div>
                    <div>
                        <Label>Владелец</Label>
                        <UserCombobox value={ownerId} onChange={setOwnerId} />
                        <p className="text-xs text-muted-foreground mt-1">
                            Смена владельца обновит `Company.owner_id` — в Mini App доступ владельца
                            к `/owner` будет у нового пользователя.
                        </p>
                    </div>
                    <div>
                        <Label>Описание</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <Button onClick={save} disabled={update.isPending}>
                        Сохранить
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Привязанные боты</CardTitle>
                </CardHeader>
                <CardContent>
                    {linkedBots.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Нет привязанных ботов.{' '}
                            <Link
                                href="/admin/booking/bots/new"
                                className="text-primary"
                            >
                                Создать
                            </Link>
                            .
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {linkedBots.map((b) => (
                                <li key={b.bot_id} className="flex items-center justify-between">
                                    <div>
                                        <span className="font-mono text-sm">{b.bot_slug}</span>{' '}
                                        <span className="text-xs text-muted-foreground">
                                            {b.bot_name ?? '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {b.is_active ? (
                                            <Badge variant="default">active</Badge>
                                        ) : (
                                            <Badge variant="secondary">off</Badge>
                                        )}
                                        <Link
                                            href={`/admin/booking/bots/${b.bot_id}`}
                                            className="text-xs text-primary"
                                        >
                                            Открыть →
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
