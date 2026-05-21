'use client'

import {
    useAdminBookingBot,
    useAdminCompany,
    useAdminUpdateBookingBot,
    useAdminUser,
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
    Switch,
} from '@doska/ui'
import { ArrowLeft, Building2, ExternalLink, Link2Off, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { CompanyCombobox } from '@/components/admin/selectors/CompanyCombobox'

function userDisplayName(u: any | undefined): string {
    if (!u) return ''
    return u.full_name || [u.surname, u.name].filter(Boolean).join(' ') || u.username || `#${u.id}`
}

export default function EditBookingBotPage() {
    const params = useParams<{ id: string }>()
    const botId = Number(params.id)
    const { data: bot, isLoading } = useAdminBookingBot(botId)
    const update = useAdminUpdateBookingBot()

    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [botType, setBotType] = useState('booking')
    const [miniAppUrl, setMiniAppUrl] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [companyId, setCompanyId] = useState<number | null>(null)

    useEffect(() => {
        if (!bot) return
        setName(bot.bot_name ?? '')
        setUsername(bot.bot_username ?? '')
        setBotType(bot.bot_type ?? 'booking')
        setMiniAppUrl(bot.mini_app_url ?? '')
        setIsActive(bot.is_active)
        setCompanyId(bot.company_id ?? null)
    }, [bot])

    const { data: company } = useAdminCompany(bot?.company_id ?? 0)
    const { data: owner } = useAdminUser(company?.owner_id ?? bot?.owner_id ?? 0)

    if (isLoading && !bot) {
        return <div>Loading...</div>
    }
    if (!bot) return null

    const save = async () => {
        const patch: any = {
            name,
            username,
            is_active: isActive,
            bot_type: botType,
            mini_app_url: miniAppUrl,
        }
        if (companyId !== (bot.company_id ?? null)) {
            patch.company_id = companyId ?? 0
        }
        await update.mutateAsync({ id: botId, body: patch })
    }

    const unlink = async () => {
        if (!bot.company_id) return
        await update.mutateAsync({ id: botId, body: { company_id: 0 } })
        setCompanyId(null)
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <Link href="/admin/booking/bots">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="size-4 mr-1" /> К списку
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{bot.bot_slug}</h1>
                {bot.is_active ? (
                    <Badge variant="default">active</Badge>
                ) : (
                    <Badge variant="secondary">off</Badge>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Бот</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Slug</Label>
                        <Input value={bot.bot_slug} readOnly disabled />
                        <p className="text-xs text-muted-foreground mt-1">
                            Не меняется — привязан к webhook URL.
                        </p>
                    </div>
                    <div>
                        <Label>Имя</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Telegram username</Label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="my_booking_bot"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Username бота без <code>@</code>. Нужен для входа через браузер
                            (Telegram Login Widget). Также выполните{' '}
                            <code>/setdomain</code> у @BotFather и укажите домен сайта.
                        </p>
                    </div>
                    <div>
                        <Label>Тип бота</Label>
                        <select
                            value={botType}
                            onChange={(e) => setBotType(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                        >
                            <option value="booking">booking</option>
                            <option value="akcha">akcha</option>
                            <option value="popytka">popytka</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                            Определяет диспетчер aiogram. Меняйте только при миграции бота
                            между доменами — после смены перезапустите FastAPI.
                        </p>
                    </div>
                    <div>
                        <Label>Mini App URL</Label>
                        <Input
                            value={miniAppUrl}
                            onChange={(e) => setMiniAppUrl(e.target.value)}
                            placeholder="https://akcha.example.com"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            URL Telegram Mini App для этого бота. Пустая строка очищает.
                            Хранится в <code>telegram_bots.data.mini_app_url</code>.
                            Перезапустите FastAPI для сброса кэша конфигурации.
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Активен</Label>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="size-4" /> Компания
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Привязка</Label>
                        <CompanyCombobox
                            value={companyId}
                            onChange={setCompanyId}
                            typeFilter="booking"
                            allowClear
                            placeholder="Не привязан"
                        />
                    </div>

                    {bot.company_id && company && (
                        <div className="rounded-md border p-3 space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{company.name}</div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        {company.slug} • id={company.id}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {company.type && <Badge variant="outline">{company.type}</Badge>}
                                    {company.status && (
                                        <Badge
                                            variant={
                                                company.status === 'active'
                                                    ? 'default'
                                                    : company.status === 'moderation'
                                                      ? 'outline'
                                                      : 'destructive'
                                            }
                                        >
                                            {company.status}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {company.description && (
                                <p className="text-xs text-muted-foreground">{company.description}</p>
                            )}
                            <div className="flex items-center justify-between pt-2">
                                <Link
                                    href={`/admin/companies/${company.id}`}
                                    className="inline-flex items-center text-sm text-primary"
                                >
                                    Открыть компанию <ExternalLink className="size-3 ml-1" />
                                </Link>
                                <Button variant="outline" size="sm" onClick={unlink}>
                                    <Link2Off className="size-4 mr-1" /> Отвязать
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {bot.company_id && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="size-4" /> Владелец
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {owner ? (
                            <div className="rounded-md border p-3 space-y-1 text-sm">
                                <div className="font-medium">{userDisplayName(owner)}</div>
                                <div className="text-xs text-muted-foreground">
                                    id={owner.id}
                                    {owner.username ? ` • @${owner.username}` : ''}
                                </div>
                                {(owner.phone || owner.email) && (
                                    <div className="text-xs text-muted-foreground">
                                        {[owner.phone, owner.email].filter(Boolean).join(' • ')}
                                    </div>
                                )}
                                <div className="pt-2">
                                    <Link
                                        href={`/admin/users/${owner.id}`}
                                        className="inline-flex items-center text-sm text-primary"
                                    >
                                        Открыть пользователя <ExternalLink className="size-3 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Загрузка…</p>
                        )}
                    </CardContent>
                </Card>
            )}

            <Button onClick={save} disabled={update.isPending}>
                Сохранить
            </Button>
        </div>
    )
}
