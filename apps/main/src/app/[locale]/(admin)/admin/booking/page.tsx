'use client'

import {
    BookingBotItem,
    useAdminBookingBots,
    useAdminLinkBookingBot,
    useAdminOnboardBooking,
    useAdminRegisterBookingBot,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Link2, Plus } from 'lucide-react'
import { useState } from 'react'

type Mode = 'link' | 'onboard' | 'register'

export default function AdminBookingPage() {
    const [onlyUnlinked, setOnlyUnlinked] = useState(false)
    const { data: bots, isLoading } = useAdminBookingBots(onlyUnlinked)
    const [mode, setMode] = useState<Mode>('onboard')
    const [presetBot, setPresetBot] = useState<BookingBotItem | null>(null)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Booking — боты и компании</h1>
                <div className="flex gap-2">
                    <Button
                        variant={onlyUnlinked ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOnlyUnlinked((v) => !v)}
                    >
                        Только непривязанные
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            setPresetBot(null)
                            setMode('register')
                        }}
                    >
                        <Plus className="size-4 mr-1" /> Зарегистрировать бот
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            setPresetBot(null)
                            setMode('onboard')
                        }}
                    >
                        <Plus className="size-4 mr-1" /> Новый бизнес + бот
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Боты</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (bots?.length ?? 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">Ботов нет.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Имя</TableHead>
                                    <TableHead>Компания</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(bots ?? []).map((b) => (
                                    <TableRow key={b.bot_id}>
                                        <TableCell className="font-mono">{b.bot_slug}</TableCell>
                                        <TableCell>{b.bot_name ?? '—'}</TableCell>
                                        <TableCell>
                                            {b.company_id ? (
                                                <span>
                                                    {b.company_name}{' '}
                                                    <span className="text-xs text-muted-foreground">
                                                        (#{b.company_id}, owner={b.owner_id})
                                                    </span>
                                                </span>
                                            ) : (
                                                <Badge variant="secondary">не привязан</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{b.is_active ? '✅' : '—'}</TableCell>
                                        <TableCell className="text-right">
                                            {!b.company_id && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setPresetBot(b)
                                                        setMode('link')
                                                    }}
                                                >
                                                    <Link2 className="size-4 mr-1" /> Привязать
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {mode === 'register' && (
                <RegisterBotForm onDone={() => setMode('link')} />
            )}
            {mode === 'onboard' && <OnboardForm />}
            {mode === 'link' && (
                <LinkForm presetBot={presetBot} />
            )}
        </div>
    )
}

function RegisterBotForm({ onDone }: { onDone: () => void }) {
    const register = useAdminRegisterBookingBot()
    const [slug, setSlug] = useState('')
    const [token, setToken] = useState('')
    const [name, setName] = useState('')

    const submit = async () => {
        if (!slug.trim() || !token.trim()) return
        await register.mutateAsync({ slug: slug.trim(), token: token.trim(), name: name || undefined })
        setSlug('')
        setToken('')
        setName('')
        onDone()
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Зарегистрировать существующий бот (без компании)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label>Bot slug</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="salon-anna" />
                </div>
                <div>
                    <Label>Bot token</Label>
                    <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="123:ABC..." />
                </div>
                <div>
                    <Label>Имя (опционально)</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <Button onClick={submit} disabled={register.isPending}>
                    Зарегистрировать
                </Button>
            </CardContent>
        </Card>
    )
}

function OnboardForm() {
    const onboard = useAdminOnboardBooking()
    const [ownerUserId, setOwnerUserId] = useState<number>(0)
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [botToken, setBotToken] = useState('')
    const [timezone, setTimezone] = useState('Asia/Almaty')
    const [currency, setCurrency] = useState('KZT')

    const submit = async () => {
        if (!ownerUserId || !name || !slug || !botToken) return
        await onboard.mutateAsync({
            owner_user_id: ownerUserId,
            name,
            slug: slug.trim(),
            bot_token: botToken.trim(),
            timezone,
            currency,
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Создать бизнес + бот за один шаг</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>Owner user ID</Label>
                        <Input
                            type="number"
                            value={ownerUserId || ''}
                            onChange={(e) => setOwnerUserId(parseInt(e.target.value, 10) || 0)}
                        />
                    </div>
                    <div>
                        <Label>Slug (company + bot)</Label>
                        <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="salon-anna" />
                    </div>
                </div>
                <div>
                    <Label>Название компании</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Салон Анны" />
                </div>
                <div>
                    <Label>Bot token (от BotFather)</Label>
                    <Input value={botToken} onChange={(e) => setBotToken(e.target.value)} placeholder="123:ABC..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>Таймзона</Label>
                        <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                    </div>
                    <div>
                        <Label>Валюта</Label>
                        <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
                    </div>
                </div>
                <Button onClick={submit} disabled={onboard.isPending}>
                    Создать
                </Button>
            </CardContent>
        </Card>
    )
}

function LinkForm({ presetBot }: { presetBot: BookingBotItem | null }) {
    const link = useAdminLinkBookingBot()
    const [botSlug, setBotSlug] = useState(presetBot?.bot_slug ?? '')
    const [ownerUserId, setOwnerUserId] = useState<number>(0)
    const [companyName, setCompanyName] = useState('')
    const [companySlug, setCompanySlug] = useState('')
    const [timezone, setTimezone] = useState('Asia/Almaty')
    const [currency, setCurrency] = useState('KZT')

    const submit = async () => {
        if (!botSlug || !ownerUserId || !companyName) return
        await link.mutateAsync({
            bot_slug: botSlug.trim(),
            owner_user_id: ownerUserId,
            company_name: companyName.trim(),
            company_slug: companySlug.trim() || undefined,
            timezone,
            currency,
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Привязать существующий бот к компании</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <Label>Bot slug</Label>
                    <Input value={botSlug} onChange={(e) => setBotSlug(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>Owner user ID</Label>
                        <Input
                            type="number"
                            value={ownerUserId || ''}
                            onChange={(e) => setOwnerUserId(parseInt(e.target.value, 10) || 0)}
                        />
                    </div>
                    <div>
                        <Label>Company slug (опционально)</Label>
                        <Input
                            value={companySlug}
                            onChange={(e) => setCompanySlug(e.target.value)}
                            placeholder={botSlug}
                        />
                    </div>
                </div>
                <div>
                    <Label>Название компании</Label>
                    <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Салон Анны"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label>Таймзона</Label>
                        <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                    </div>
                    <div>
                        <Label>Валюта</Label>
                        <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
                    </div>
                </div>
                <Button onClick={submit} disabled={link.isPending}>
                    Привязать
                </Button>
            </CardContent>
        </Card>
    )
}
