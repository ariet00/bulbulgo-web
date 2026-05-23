'use client'

import { useAdminCreateCompany } from '@doska/shared'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Textarea,
} from '@doska/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
    CATEGORIES_BY_TYPE,
    CompanyCategorySelect,
    CompanyStatusSelect,
    CompanyTypeSelect,
    CurrencySelect,
    TimezoneSelect,
} from '@/components/admin/selectors/StaticSelects'
import { UserCombobox } from '@/components/admin/selectors/UserCombobox'

export default function NewCompanyPage() {
    const router = useRouter()
    const create = useAdminCreateCompany()

    const [ownerId, setOwnerId] = useState<number | null>(null)
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [type, setType] = useState<string>('booking')
    const [category, setCategory] = useState<string>('')
    const [status, setStatus] = useState<string>('active')

    const onTypeChange = (next: string) => {
        setType(next)
        setCategory('')
    }
    const [description, setDescription] = useState('')
    const [legalForm, setLegalForm] = useState<'ip' | 'legal'>('ip')

    const [timezone, setTimezone] = useState<string>('Asia/Almaty')
    const [currency, setCurrency] = useState<string>('KZT')

    const submit = async () => {
        if (!ownerId || !name.trim() || !slug.trim() || !type) return
        const body: any = {
            owner_user_id: ownerId,
            name: name.trim(),
            slug: slug.trim(),
            type,
            category: category || undefined,
            status,
            legal_form: legalForm,
            description: description || undefined,
        }
        if (type === 'booking') {
            body.timezone = timezone
            body.currency = currency
        }
        const created = await create.mutateAsync(body)
        router.push(`/admin/companies/${created.id}`)
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-2xl font-bold">Создать компанию</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Основное</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Название *</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Slug *</Label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="salon-anna"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label>Тип *</Label>
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
                        <p className="text-xs text-muted-foreground mt-1">
                            Для Юр-компаний в miniapp доступна вкладка «Сотрудники» и приглашения.
                        </p>
                    </div>
                    <div>
                        <Label>Владелец *</Label>
                        <UserCombobox value={ownerId} onChange={setOwnerId} />
                    </div>
                    <div>
                        <Label>Описание</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {type === 'booking' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Booking-настройки</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground">
                            Создаются автоматически вместе с компанией. Расписание по умолчанию:
                            пн–сб 09:00–20:00, вс — выходной.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label>Таймзона</Label>
                                <TimezoneSelect value={timezone} onChange={setTimezone} />
                            </div>
                            <div>
                                <Label>Валюта</Label>
                                <CurrencySelect value={currency} onChange={setCurrency} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button onClick={submit} disabled={create.isPending}>
                Создать
            </Button>
        </div>
    )
}
