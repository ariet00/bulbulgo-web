'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { requester } from '@/lib/requester';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRegionStore } from '@/store/useRegionStore';

interface Suggestion {
    type: 'search';
    text: string;
    value: string;
    id?: number;
}
// TODO: улучшить синхронизацию с URL

export default function SearchInput() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [isOpen, setIsOpen] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const t = useTranslations('Navbar');

    const { data: suggestions, isLoading } = useQuery({
        queryKey: ['search-suggestions', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery || debouncedQuery.length < 1) return [];
            // Search API might be disabled, so we wrap in try-catch or handle error
            try {
                const response = await requester.get<Suggestion[]>('/search/suggestions', {
                    params: { q: debouncedQuery }
                });
                return response.data;
            } catch (error) {
                console.error('Search suggestions failed', error);
                return [];
            }
        },
        enabled: debouncedQuery.length > 0,
    });

    useEffect(() => {
        setQuery(searchParams.get('q') || '');
    }, [searchParams]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { currentRegionSlug } = useRegionStore();

    const handleSelect = (suggestion: Suggestion) => {
        setIsOpen(false);
        setQuery(''); // Or keep it? Usually clear or set to selected

        const regionPrefix = currentRegionSlug ? `/${currentRegionSlug}` : '';
        router.push(`${regionPrefix}?q=${encodeURIComponent(suggestion.value)}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsOpen(false);
            const regionPrefix = currentRegionSlug ? `/${currentRegionSlug}` : '';
            router.push(`${regionPrefix}?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="relative flex-1" ref={containerRef}>
            <Input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                placeholder={t('searchPlaceholder')}
                className="h-10 w-full border-none bg-transparent pl-4 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {/* <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" /> */}

            {isOpen && suggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover text-popover-foreground rounded-md border shadow-md z-50 overflow-hidden">
                    <div className="py-1">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={`${suggestion.type}-${index}`}
                                className={cn(
                                    "px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                                    suggestion.type === 'search' && "font-medium"
                                )}
                                onClick={() => handleSelect(suggestion)}
                            >
                                <Search className="h-3 w-3" />
                                <span>{suggestion.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
