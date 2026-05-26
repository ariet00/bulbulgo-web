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
    CATEGORIES_BY_TYPE,
    CompanyCategorySelect,
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
    const [category, setCategory] = useState<string>('')
    const [status, setStatus] = useState<string>('')
    const [description, setDescription] = useState('')
    const [legalForm, setLegalForm] = useState<'ip' | 'legal'>('ip')

    useEffect(() => {
        if (!company) return
        setOwnerId(company.owner_id ?? null)
        setName(company.name ?? '')
        setSlug(company.slug ?? '')
        setType(company.type ?? '')
        setCategory(company.category ?? '')
        setStatus(company.status ?? '')
        setDescription(company.description ?? '')
        setLegalForm(company.legal_form === 'legal' ? 'legal' : 'ip')
    }, [company])

    const onTypeChange = (next: string) => {
        setType(next)
        if (!(CATEGORIES_BY_TYPE[next] || []).some((c) => c.value === category)) {
            setCategory('')
        }
    }

    if (isLoading || !company) return <div>Loading...</div>

    const save = async () => {
        const body: any = {}
        if (ownerId && ownerId !== company.owner_id) body.owner_user_id = ownerId
        if (name !== company.name) body.name = name
        if (slug !== company.slug) body.slug = slug
        if (type !== company.type) body.type = type
        if (category !== (company.category ?? '')) body.category = category || undefined
        if (status !== company.status) body.status = status
        if ((description || '') !== (company.description || '')) body.description = description
        if (legalForm !== (company.legal_form ?? 'ip')) body.legal_form = legalForm
        if (Object.keys(body).length === 0) return
        await update.mutateAsync({ id: companyId, body })
    }

    const linkedBots = (allBots ?? []).filter((b) => b.company_id === companyId)

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
                <Link href="/admin/companies">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="size-4 mr-1" /> К списку
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold break-all">{company.name}</h1>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label>Тип</Label>
                            <CompanyTypeSelect value={type} onChange={onTypeChange} />
                        </div>
                        <div>
                            <Label>Статус</Label>
                            <CompanyStatusSelect value={status} onChange={setStatus} />
                        </div>
                    </div>
                    {(CATEGORIES_BY_TYPE[type]?.length ?? 0) > 0 && (
                        <div>
                            <Label>Категория</Label>
                            <CompanyCategorySelect type={type} value={category} onChange={setCategory} />
                        </div>
                    )}
                    <div>
                        <Label>Юридическая форма</Label>
                        <select
                            value={legalForm}
                            onChange={(e) => setLegalForm(e.target.value as 'ip' | 'legal')}
                            className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                        >
                            <option value="ip">ИП (один владелец)</option>
                            <option value="legal">Юр. лицо (владелец + сотрудники)</option>
                        </select>
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
