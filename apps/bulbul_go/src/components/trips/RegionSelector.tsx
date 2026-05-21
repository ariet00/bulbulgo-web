'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@doska/shared';
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
} from '@doska/ui';
import { useRegions } from '@doska/shared';

interface RegionSelectorProps {
    value?: number;
    onChange: (id?: number) => void;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
    leafOnly?: boolean;
}

export function RegionSelector({
    value,
    onChange,
    placeholder = 'Выберите регион',
    label,
    icon,
    leafOnly = false
}: RegionSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const { data: regions = [], isLoading } = useRegions(leafOnly);

    const selectedRegion = React.useMemo(() => 
        regions.find((r) => r.id === value),
    [regions, value]);

    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-sm font-medium text-muted-foreground ml-1">{label}</label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between h-12 px-4 rounded-2xl border-none bg-secondary/50 hover:bg-secondary/80 transition-all",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            {icon && <div className="shrink-0">{icon}</div>}
                            <span className="truncate">
                                {selectedRegion ? selectedRegion.name : placeholder}
                            </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl overflow-hidden" align="start">
                    <Command className="rounded-none">
                        <CommandInput placeholder="Поиск региона..." className="h-12" />
                        <CommandList className="max-h-[300px]">
                            <CommandEmpty>Регион не найден.</CommandEmpty>
                            <CommandGroup>
                                {isLoading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">Загрузка...</div>
                                ) : (
                                    regions.map((region) => (
                                        <CommandItem
                                            key={region.id}
                                            value={region.name}
                                            onSelect={() => {
                                                onChange(region.id === value ? undefined : region.id);
                                                setOpen(false);
                                            }}
                                            className="h-11 px-4"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === region.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {region.name}
                                        </CommandItem>
                                    ))
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
