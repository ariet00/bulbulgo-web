'use client'

import { ReactNode, useState } from 'react'
import { Button, Input, Popover, PopoverContent, PopoverTrigger } from '@doska/ui'
import { Pencil } from 'lucide-react'

// Inline editor for a numeric limit value (credits / free-used): set an
// absolute value, plus an optional quick-reset button.
export function AdjustPopover({
    title,
    current,
    display,
    pending,
    onSubmit,
    quickResetTo,
    quickResetLabel,
    align = 'end',
}: {
    title: string
    current: number
    display: ReactNode
    pending: boolean
    onSubmit: (value: number) => void
    quickResetTo?: number
    quickResetLabel?: string
    align?: 'start' | 'center' | 'end'
}) {
    const [open, setOpen] = useState(false)
    const [val, setVal] = useState('')

    const handleOpenChange = (o: boolean) => {
        setOpen(o)
        if (o) {
            setVal(String(current))
        }
    }

    const submit = () => {
        const n = Number(val)
        if (!Number.isFinite(n) || val === '') return
        onSubmit(Math.trunc(n))
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 tabular-nums hover:underline"
                >
                    {display}
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 space-y-3" align={align}>
                <div className="text-sm font-medium">{title}</div>
                <Input
                    type="number"
                    autoFocus
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') submit()
                    }}
                    placeholder="значение"
                />
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        className="flex-1"
                        disabled={pending || val === ''}
                        onClick={submit}
                    >
                        Сохранить
                    </Button>
                    {quickResetTo !== undefined && (
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() => {
                                onSubmit(quickResetTo)
                                setOpen(false)
                            }}
                        >
                            {quickResetLabel ?? 'Сброс'}
                        </Button>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">Текущее: {current}</p>
            </PopoverContent>
        </Popover>
    )
}

export type LimitStatusData = {
    is_limited: boolean
    limit_override: boolean | null
    window_views: number
    active_days: number
}

// Shows the *effective* limited tier (manual override ?? live compute) and lets
// an admin force/clear the persistent override — the gate the live limiter reads.
export function LimitStatusControl({
    d,
    pending,
    onSet,
    align = 'start',
}: {
    d: LimitStatusData
    pending: boolean
    onSet: (value: number | null) => void
    align?: 'start' | 'center' | 'end'
}) {
    const [open, setOpen] = useState(false)
    const effective = d.limit_override ?? d.is_limited
    const forced = d.limit_override !== null
    const diverges = forced && d.limit_override !== d.is_limited

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button" className="inline-flex items-center gap-1">
                    {effective ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                            строгий
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            общий
                        </span>
                    )}
                    {forced && (
                        <span
                            className="text-xs"
                            title={`Ручная фиксация тарифа${
                                diverges
                                    ? ` · расчёт: ${d.is_limited ? 'строгий' : 'общий'}`
                                    : ''
                            }`}
                        >
                            📌
                        </span>
                    )}
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 space-y-2" align={align}>
                <div className="text-xs text-muted-foreground">
                    Расчёт: {d.is_limited ? 'строгий' : 'общий'} тариф ({d.window_views} просм.
                    / {d.active_days} дн.)
                    {forced && (
                        <div className="mt-0.5">
                            Зафиксировано: {d.limit_override ? 'строгий' : 'общий'} тариф
                        </div>
                    )}
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    disabled={pending}
                    onClick={() => {
                        onSet(1)
                        setOpen(false)
                    }}
                >
                    Строгий тариф
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    disabled={pending}
                    onClick={() => {
                        onSet(0)
                        setOpen(false)
                    }}
                >
                    Общий тариф
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    disabled={pending}
                    onClick={() => {
                        onSet(null)
                        setOpen(false)
                    }}
                >
                    Авто (сбросить)
                </Button>
            </PopoverContent>
        </Popover>
    )
}
