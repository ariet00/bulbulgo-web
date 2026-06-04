'use client'

import { useRegions } from '@doska/shared'
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
    leafOnly?: boolean
}

export function RegionCombobox({ value, onChange, placeholder = 'Регион…', leafOnly = false }: Props) {
    const [open, setOpen] = useState(false)
    const { data: regions = [], isLoading } = useRegions(leafOnly)

    const selected = regions.find((r) => r.id === value)

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
                <Command>
                    <CommandInput placeholder="Поиск региона…" />
                    <CommandList>
                        {isLoading ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">Загрузка…</div>
                        ) : (
                            <>
                                <CommandEmpty>Регион не найден.</CommandEmpty>
                                <CommandGroup>
                                    {regions.map((region) => (
                                        <CommandItem
                                            key={region.id}
                                            value={region.name}
                                            onSelect={() => {
                                                onChange(region.id === value ? null : region.id)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 ${value === region.id ? 'opacity-100' : 'opacity-0'}`}
                                            />
                                            {region.name}
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
