'use client'

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

import { useAdminRegion, useAdminRegions } from '@/hooks/queries/admin'

type Props = {
    value: number | null
    onChange: (id: number | null) => void
    placeholder?: string
}

const SEARCH_LIMIT = 50

export function RegionCombobox({ value, onChange, placeholder = 'Регион…' }: Props) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const q = useDebounce(search, 250)

    const { data: regions = [], isFetching } = useAdminRegions(q || undefined, SEARCH_LIMIT)
    // The selected region often isn't in the current search page, so fetch it on its own.
    const { data: selected } = useAdminRegion(value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal"
                >
                    <span className={`truncate ${selected ? '' : 'text-muted-foreground'}`}>
                        {selected ? selected.name : placeholder}
                    </span>
                    {value != null ? (
                        <X
                            className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation()
                                onChange(null)
                            }}
                        />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Поиск региона…"
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {isFetching && regions.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">Загрузка…</div>
                        ) : (
                            <>
                                <CommandEmpty>Регион не найден.</CommandEmpty>
                                <CommandGroup>
                                    {regions.map((region) => (
                                        <CommandItem
                                            key={region.id}
                                            value={String(region.id)}
                                            onSelect={() => {
                                                onChange(region.id === value ? null : region.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 shrink-0 ${value === region.id ? 'opacity-100' : 'opacity-0'}`}
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate">{region.name}</div>
                                                {region.sub_name ? (
                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {region.sub_name}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
