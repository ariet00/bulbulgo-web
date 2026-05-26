'use client'

import type { ChannelType, ParserChannel, TripRole } from '@doska/shared'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Checkbox,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Textarea,
} from '@doska/ui'

const ALL_ROLES: { value: TripRole; label: string }[] = [
    { value: 'driver', label: 'Водители' },
    { value: 'passenger', label: 'Пассажиры' },
    { value: 'parcel', label: 'Посылки' },
]

const CHANNEL_TYPE_OPTIONS: { value: ChannelType; label: string }[] = [
    { value: 'parse', label: 'Парсинг' },
    { value: 'publish', label: 'Публикация' },
    { value: 'both', label: 'И парсинг и публикация' },
    { value: 'none', label: 'Не используется' },
]

export type ChannelFormState = {
    chat_id: string
    bot_id: string // string so empty input → null
    is_active: boolean
    channel_type: ChannelType
    use_parser_ai: boolean
    ai_fallback: boolean
    limit_message: number
    skip_keywords: string // newline-separated
    sort_order: number
    bot_username: string
    allowed_roles: TripRole[]
}

export const emptyChannel: ChannelFormState = {
    chat_id: '',
    bot_id: '',
    is_active: true,
    channel_type: 'parse',
    use_parser_ai: false,
    ai_fallback: false,
    limit_message: 5,
    skip_keywords: '',
    sort_order: 100,
    bot_username: '',
    allowed_roles: [],
}

export function channelFromRow(row: ParserChannel): ChannelFormState {
    return {
        chat_id: row.chat_id,
        bot_id: row.bot_id == null ? '' : String(row.bot_id),
        is_active: row.is_active,
        channel_type: row.channel_type,
        use_parser_ai: row.parser.use_parser_ai,
        ai_fallback: row.parser.ai_fallback,
        limit_message: row.parser.limit_message,
        skip_keywords: (row.parser.skip_keywords || []).join('\n'),
        sort_order: row.parser.sort_order,
        bot_username: row.parser.bot_username || '',
        allowed_roles: (row.parser.allowed_roles || []) as TripRole[],
    }
}

export function channelToBody(s: ChannelFormState) {
    const bot_id = s.bot_id.trim() ? Number(s.bot_id) : null
    return {
        chat_id: s.chat_id.trim(),
        bot_id: Number.isFinite(bot_id as number) ? (bot_id as number | null) : null,
        is_active: s.is_active,
        channel_type: s.channel_type,
        parser: {
            use_parser_ai: s.use_parser_ai,
            ai_fallback: s.ai_fallback,
            limit_message: Number(s.limit_message) || 5,
            skip_keywords: s.skip_keywords
                .split('\n')
                .map((k) => k.trim())
                .filter(Boolean),
            sort_order: Number(s.sort_order) || 100,
            bot_username: s.bot_username.trim(),
            allowed_roles: s.allowed_roles,
        },
    }
}

type Props = {
    value: ChannelFormState
    onChange: (next: ChannelFormState) => void
}

export function ChannelForm({ value: v, onChange }: Props) {
    const set = (patch: Partial<ChannelFormState>) => onChange({ ...v, ...patch })

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Основное</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label>chat_id</Label>
                            <Input
                                value={v.chat_id}
                                onChange={(e) => set({ chat_id: e.target.value })}
                                placeholder="taksibatken или -1001234..."
                            />
                        </div>
                        <div>
                            <Label>bot_id (опц.)</Label>
                            <Input
                                value={v.bot_id}
                                onChange={(e) => set({ bot_id: e.target.value })}
                                placeholder="оставь пусто, если без бота"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={v.is_active}
                            onCheckedChange={(c) => set({ is_active: c })}
                        />
                        <Label>Активен (парсер читает / публикатор постит)</Label>
                    </div>
                    <div>
                        <Label>Тип канала</Label>
                        <Select
                            value={v.channel_type}
                            onValueChange={(c) => set({ channel_type: c as ChannelType })}
                        >
                            <SelectTrigger className="w-full sm:max-w-xs">
                                <SelectValue placeholder="Выбери тип" />
                            </SelectTrigger>
                            <SelectContent>
                                {CHANNEL_TYPE_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            <b>Парсинг</b> — парсер читает сообщения из чата.{' '}
                            <b>Публикация</b> — бот публикует сюда трипы.{' '}
                            <b>И то, и другое</b> — оба режима.{' '}
                            <b>Не используется</b> — выключен (parked).
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Парсер</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={v.use_parser_ai}
                            onCheckedChange={(c) => set({ use_parser_ai: c })}
                        />
                        <Label>
                            Использовать ИИ-парсер (free-form). Иначе — regex-парсер.
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={v.ai_fallback}
                            onCheckedChange={(c) => set({ ai_fallback: c })}
                            disabled={v.use_parser_ai}
                        />
                        <Label>
                            AI fallback (имеет смысл только если ИИ-парсер выключен — regex
                            пробует первым, ИИ подключается когда regex не справился).
                        </Label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <Label>limit_message</Label>
                            <Input
                                type="number"
                                value={v.limit_message}
                                onChange={(e) =>
                                    set({ limit_message: Number(e.target.value) })
                                }
                            />
                        </div>
                        <div>
                            <Label>sort_order</Label>
                            <Input
                                type="number"
                                value={v.sort_order}
                                onChange={(e) =>
                                    set({ sort_order: Number(e.target.value) })
                                }
                            />
                        </div>
                        <div>
                            <Label>bot_username (опц.)</Label>
                            <Input
                                value={v.bot_username}
                                onChange={(e) => set({ bot_username: e.target.value })}
                                placeholder="Poputka_KG_rides_Bot"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>skip_keywords (по одному на строку)</Label>
                        <Textarea
                            value={v.skip_keywords}
                            onChange={(e) => set({ skip_keywords: e.target.value })}
                            rows={4}
                            placeholder={'по бишкеку\nреклама'}
                        />
                    </div>
                    <div>
                        <Label>Какие роли парсить</Label>
                        <div className="flex flex-wrap gap-3 sm:gap-4 mt-2">
                            {ALL_ROLES.map(({ value, label }) => {
                                const checked = v.allowed_roles.includes(value)
                                return (
                                    <label
                                        key={value}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={(c) => {
                                                const next = c
                                                    ? Array.from(new Set([...v.allowed_roles, value]))
                                                    : v.allowed_roles.filter((r) => r !== value)
                                                set({ allowed_roles: next })
                                            }}
                                        />
                                        <span className="text-sm">{label}</span>
                                    </label>
                                )
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Если ничего не выбрано — парсим все роли (driver / passenger / parcel).
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

type ActionsProps = {
    onSave: () => void
    onCancel: () => void
    saveLabel: string
    saving: boolean
}

export function ChannelFormActions({ onSave, onCancel, saveLabel, saving }: ActionsProps) {
    return (
        <div className="flex gap-2">
            <Button onClick={onSave} disabled={saving}>
                {saveLabel}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
                Отмена
            </Button>
        </div>
    )
}
