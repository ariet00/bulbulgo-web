'use client'

import { useAdminCompanies, useAdminCompany, useDebounce } from '@doska/shared'
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
    typeFilter?: string
    placeholder?: string
    allowClear?: boolean
}

function companyLabel(c: any): string {
    if (!c) return ''
    return `${c.name} (${c.slug})`
}

export function CompanyCombobox({
    value,
    onChange,
    typeFilter,
    placeholder = 'Выберите компанию…',
    allowClear,
}: Props) {
    const [open, setOpen] = useState(false)
    const [q, setQ] = useState('')
    const dq = useDebounce(q, 250)
    const { data: results, isFetching } = useAdminCompanies(1, 20, dq || undefined, typeFilter)
    const { data: current } = useAdminCompany(value ?? 0)

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
                        {value && current ? companyLabel(current) : placeholder}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                        {allowClear && value && (
                            <X
                                className="h-4 w-4 opacity-60 hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onChange(null)
                                }}
                            />
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Поиск по имени, slug, id…"
                        value={q}
                        onValueChange={setQ}
                    />
                    <CommandList>
                        {isFetching && <CommandEmpty>Загрузка…</CommandEmpty>}
                        {!isFetching && (results?.items?.length ?? 0) === 0 && (
                            <CommandEmpty>Ничего не найдено</CommandEmpty>
                        )}
                        <CommandGroup>
                            {(results?.items ?? []).map((c: any) => (
                                <CommandItem
                                    key={c.id}
                                    value={String(c.id)}
                                    onSelect={() => {
                                        onChange(c.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={`mr-2 h-4 w-4 ${value === c.id ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm">{c.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {c.slug} • id={c.id}
                                            {c.type ? ` • ${c.type}` : ''}
                                        </span>
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
