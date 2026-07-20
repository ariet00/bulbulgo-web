'use client'

import { create } from 'zustand'
import { emptyDraft, type FilterDraft } from '../components/FilterSheet'
import type { ListingFilters, ListingKind } from './types'

// Глобальный (на сессию вебвью) стор фильтров ленты. Зачем стор, а не useState
// в MarketClient: экран ленты размонтируется при переходе на карточку, и его
// локальное состояние (ветка, фильтры, сортировка) терялось бы — «назад»
// возвращал бы сброшенную ленту. Синглтон zustand переживает размонтирование,
// поэтому фильтры сохраняются между заходами. Серверные данные тут не хранятся
// (они в React Query) — только пользовательский выбор фильтрации.

type SortValue = NonNullable<ListingFilters['sort']>

interface FeedState {
    tabId: number | null
    kind: ListingKind
    make?: string
    models: string[]
    draft: FilterDraft
    sort: SortValue

    setKind: (k: ListingKind) => void
    setMake: (m: string | undefined) => void
    setModels: (m: string[]) => void
    setDraft: (d: FilterDraft) => void
    setSort: (s: SortValue) => void
    /** смена ветки: сбрасывает фильтры прошлой категории (разные атрибуты) */
    changeTab: (id: number) => void
}

export const useFeedStore = create<FeedState>((set) => ({
    tabId: null,
    kind: 'offer',
    make: undefined,
    models: [],
    draft: emptyDraft(),
    sort: 'fresh',

    setKind: (kind) => set({ kind }),
    setMake: (make) => set({ make }),
    setModels: (models) => set({ models }),
    setDraft: (draft) => set({ draft }),
    setSort: (sort) => set({ sort }),
    changeTab: (id) =>
        set({ tabId: id, make: undefined, models: [], draft: emptyDraft() }),
}))
