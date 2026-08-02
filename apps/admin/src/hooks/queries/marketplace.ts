import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { marketplaceAdminApi, McListingsParams } from '@/apis/marketplace'

export const mpKeys = {
    all: ['marketplace'] as const,
    categories: (includeInactive: boolean) =>
        [...mpKeys.all, 'categories', includeInactive] as const,
    categoryAttributes: (id: number) =>
        [...mpKeys.all, 'category-attributes', id] as const,
    categoryBindings: (id: number) =>
        [...mpKeys.all, 'category-bindings', id] as const,
    categoryGroups: (id: number) =>
        [...mpKeys.all, 'category-groups', id] as const,
    attributes: (includeInactive: boolean) =>
        [...mpKeys.all, 'attributes', includeInactive] as const,
    listings: (params: McListingsParams) =>
        [...mpKeys.all, 'listings', params] as const,
}

export const useMpCategories = (includeInactive = true) =>
    useQuery({
        queryKey: mpKeys.categories(includeInactive),
        queryFn: () => marketplaceAdminApi.getCategories(includeInactive),
    })

export const useMpCategoryAttributes = (id: number | null) =>
    useQuery({
        queryKey: mpKeys.categoryAttributes(id ?? -1),
        queryFn: () => marketplaceAdminApi.getCategoryAttributes(id as number),
        enabled: id != null,
    })

export const useMpCategoryBindings = (id: number | null) =>
    useQuery({
        queryKey: mpKeys.categoryBindings(id ?? -1),
        queryFn: () => marketplaceAdminApi.getCategoryBindings(id as number),
        enabled: id != null,
    })

export const useMpCategoryGroups = (id: number | null) =>
    useQuery({
        queryKey: mpKeys.categoryGroups(id ?? -1),
        queryFn: () => marketplaceAdminApi.getCategoryGroups(id as number),
        enabled: id != null,
    })

export const useMpAttributes = (includeInactive = true) =>
    useQuery({
        queryKey: mpKeys.attributes(includeInactive),
        queryFn: () => marketplaceAdminApi.getAttributes(includeInactive),
    })

export const useMpListings = (params: McListingsParams) =>
    useQuery({
        queryKey: mpKeys.listings(params),
        queryFn: () => marketplaceAdminApi.getListings(params),
        placeholderData: keepPreviousData,
    })
