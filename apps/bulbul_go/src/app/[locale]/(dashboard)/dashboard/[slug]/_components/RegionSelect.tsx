'use client';

import { useQuery, getRegions } from '@doska/shared';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@doska/ui';

interface RegionSelectProps {
    value?: number | null;
    onChange: (id: number) => void;
    placeholder?: string;
}

export default function RegionSelect({ value, onChange, placeholder }: RegionSelectProps) {
    const { data: regions = [] } = useQuery({
        queryKey: ['regions', 'leaf'],
        queryFn: () => getRegions(true),
    });

    return (
        <Select
            value={value ? String(value) : undefined}
            onValueChange={(v) => onChange(Number(v))}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder || 'Выберите город'} />
            </SelectTrigger>
            <SelectContent>
                {regions.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                        {r.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
