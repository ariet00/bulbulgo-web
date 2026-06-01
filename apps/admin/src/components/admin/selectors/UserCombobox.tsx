'use client'

import { useAdminUser, useAdminUserSearch } from '@/hooks/queries/admin'
import { useDebounce } from '@doska/shared'
import {
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@doska/ui'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'

type Props = {
    value: number | null
    onChange: (id: number | null) => void
    placeholder?: string
    allowClear?: boolean
}

function userLabel(u: any): string {
    const name = u.full_name || [u.surname, u.name].filter(Boolean).join(' ') || u.username || `#${u.id}`
    const extra = [u.phone, u.email].filter(Boolean).join(' • ')
    return extra ? `${name} (${extra})` : name
}

export function UserCombobox({ value, onChange, placeholder = 'Выберите пользователя…', allowClear }: Props) {
    const [open, setOpen] = useState(false)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 250)
    const { data: results, isFetching } = useAdminUserSearch(dq)
    const { data: current } = useAdminUser(value ?? 0)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className="truncate text-left">
                        {value && current ? userLabel(current) : placeholder}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                        {allowClear && value ? (
                            <span
                                role="button"
                                tabIndex={-1}
                                aria-label="Очистить"
                                className="inline-flex items-center justify-center rounded-sm p-0.5 opacity-60 hover:opacity-100"
                                onPointerDown={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    onChange(null)
                                }}
                            >
                                <X className="h-4 w-4" />
                            </span>
                        ) : null}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Поиск по имени, телефону, email, id…"
                        value={q}
                        onValueChange={setQ}
                    />
                    <CommandList>
                        {!dq && (
                            <CommandEmpty>Введите запрос…</CommandEmpty>
                        )}
                        {dq && !isFetching && (results?.items?.length ?? 0) === 0 && (
                            <CommandEmpty>Ничего не найдено</CommandEmpty>
                        )}
                        {isFetching && <CommandEmpty>Загрузка…</CommandEmpty>}
                        <CommandGroup>
                            {(results?.items ?? []).map((u: any) => (
                                <CommandItem
                                    key={u.id}
                                    value={String(u.id)}
                                    onSelect={() => {
                                        onChange(u.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${value === u.id ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm">{userLabel(u)}</span>
                                        <span className="text-xs text-muted-foreground">id={u.id}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
