'use client'

import { useAdminRegisterBookingBot, useAdminUpdateBookingBot } from '@doska/shared'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
} from '@doska/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CompanyCombobox } from '@/components/admin/selectors/CompanyCombobox'

export default function NewBookingBotPage() {
    const router = useRouter()
    const register = useAdminRegisterBookingBot()
    const updateBot = useAdminUpdateBookingBot()

    const [slug, setSlug] = useState('')
    const [token, setToken] = useState('')
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [companyId, setCompanyId] = useState<number | null>(null)

    const submit = async () => {
        if (!slug.trim() || !token.trim()) return
        const created = await register.mutateAsync({
            slug: slug.trim(),
            token: token.trim(),
            name: name || undefined,
            username: username.trim() || undefined,
        })
        if (companyId) {
            await updateBot.mutateAsync({
                id: created.bot_id,
                body: { company_id: companyId },
            })
        }
        router.push(`/admin/booking/bots/${created.bot_id}`)
    }

    const pending = register.isPending || updateBot.isPending

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-2xl font-bold">Создать бот</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Параметры бота</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Slug *</Label>
                        <Input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="salon-anna"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Используется в webhook URL — поменять после создания нельзя.
                        </p>
                    </div>
                    <div>
                        <Label>Token *</Label>
                        <Input
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="123:ABC..."
                            type="password"
                        />
                    </div>
                    <div>
                        <Label>Имя</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Анна Парикмахер"
                        />
                    </div>
                    <div>
                        <Label>Telegram username</Label>
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="my_booking_bot"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Без <code>@</code>. Нужен для входа через браузер (Login Widget).
                        </p>
                    </div>
                    <div>
                        <Label>Компания (опционально)</Label>
                        <CompanyCombobox
                            value={companyId}
                            onChange={setCompanyId}
                            typeFilter="booking"
                            allowClear
                            placeholder="Выберите booking-компанию…"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Если пусто — бот создастся непривязанным, можно привязать позже.
                        </p>
                    </div>
                    <Button onClick={submit} disabled={pending}>
                        Создать
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
