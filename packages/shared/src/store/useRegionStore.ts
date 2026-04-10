import { create } from 'zustand';

interface RegionState {
    currentRegionSlug: string;
    setRegionSlug: (slug: string) => void;
}

export const useRegionStore = create<RegionState>()(
    (set) => ({
        currentRegionSlug: 'kyrgyzstan', // Default
        setRegionSlug: (slug) => set({ currentRegionSlug: slug }),
    })
);
