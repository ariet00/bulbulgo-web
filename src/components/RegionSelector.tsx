'use client';

import { useQuery } from '@tanstack/react-query';
import { getRegions } from '@/apis/regions';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MapPin } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useRegionStore } from '@/store/useRegionStore';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function RegionSelector() {
    const router = useRouter();
    const params = useParams();
    const setRegionSlug = useRegionStore((state) => state.setRegionSlug);
    const currentRegionSlug = useRegionStore((state) => state.currentRegionSlug || '');

    const { data: regions } = useQuery({
        queryKey: ['regions', 'leaf'],
        queryFn: () => getRegions(true),
    });

    const pathname = usePathname();

    // Sync from URL if present
    useEffect(() => {
        if (!params?.region) {
            setRegionSlug('kyrgyzstan');
            return;
        } else if (typeof params.region === 'string') {
            setRegionSlug(params.region)
        }
    }, [params?.region]);

    const handleValueChange = (value: string) => {
        if (value) {
            setRegionSlug(value);

            if (params?.region && typeof params.region === 'string') {
                // Replace the current region in the path with the new one
                // We use a regex to ensure we only replace the region segment at the start
                // or after a slash, though usually it's the first segment after locale (which usePathname strips)

                // usePathname from next-intl returns path without locale.
                // e.g. /bishkek/category/foo

                // If the path starts with the region
                if (pathname.startsWith(`/${params.region}`)) {
                    const newPath = pathname.replace(`/${params.region}`, `/${value}`);
                    router.push(newPath);
                } else {
                    // Fallback if path doesn't start with region (unlikely if param is set)
                    router.push(`/${value}`);
                }
            } else {
                // If no region param (e.g. root /), just go to new region
                router.push(`/${value}`);
            }
        }
    };

    return (
        <Select value={currentRegionSlug} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[180px] border-none bg-transparent focus:ring-0 focus:ring-offset-0">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <MapPin className="h-4 w-4" />
                    <SelectValue placeholder="Select Region" />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem key="kyrgyzstan" value="kyrgyzstan">
                    Кыргызстан
                </SelectItem>
                {regions?.map((region) => (
                    <SelectItem key={region.id} value={region.slug}>
                        {region.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
