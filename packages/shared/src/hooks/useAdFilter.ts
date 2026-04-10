'use client';

import { useState } from 'react';

export type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc';

export function useAdFilter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    return {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
    };
}
