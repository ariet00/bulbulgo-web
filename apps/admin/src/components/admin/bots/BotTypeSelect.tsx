'use client'

import {
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@doska/ui'
import { BotTypeSpec } from '@/apis/admin'
import { useAdminBotTypes } from '@/hooks/queries/admin'

/** Описание типа бота из каталога бэкенда — по нему форма решает, что показывать. */
export function useBotTypeSpec(botType: string): {
    spec: BotTypeSpec | undefined
    hasField: (field: string) => boolean
    isLoading: boolean
} {
    const { data, isLoading } = useAdminBotTypes()
    const spec = data?.find((t) => t.value === botType)
    return {
        spec,
        // Пока каталог не приехал, полей не показываем — иначе форма прыгает.
        hasField: (field: string) => !!spec?.fields.includes(field),
        isLoading,
    }
}

export function BotTypeSelect({
    value,
    onChange,
}: {
    value: string
    onChange: (value: string) => void
}) {
    const { data: types } = useAdminBotTypes()
    const spec = types?.find((t) => t.value === value)
    // У старых ботов встречаются типы вне каталога (main/secondary) — показываем
    // как есть, чтобы правка имени не переводила бота на другой диспетчер.
    const legacy = !!value && !!types && !spec

    return (
        <div>
            <Label>Тип бота</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                    {legacy && (
                        <SelectItem value={value}>{value} — устаревший тип</SelectItem>
                    )}
                    {(types ?? []).map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                            {t.label} · {t.value}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
                {spec?.description ??
                    'Тип определяет, какой диспетчер aiogram обрабатывает апдейты бота.'}
            </p>
            {spec && !spec.receives_updates && (
                <p className="text-xs text-muted-foreground mt-1">
                    Вебхук такому боту не ставится — он только отправляет сообщения.
                </p>
            )}
        </div>
    )
}
