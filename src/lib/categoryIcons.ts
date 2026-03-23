import { Car, Home, Wrench, Sprout, HardHat, Smartphone, Briefcase, Shirt, Trophy, Dog, Truck, Baby, Stethoscope, Map, Gift } from 'lucide-react';

export const categoryIcons: Record<string, { icon: any, color: string, darkColor: string }> = {
    'transport': { icon: Car, color: 'bg-blue-100', darkColor: 'dark:bg-blue-900/20' },
    'nedvizhimost': { icon: Home, color: 'bg-purple-100', darkColor: 'dark:bg-purple-900/20' },
    'uslugi': { icon: Wrench, color: 'bg-yellow-100', darkColor: 'dark:bg-yellow-900/20' },
    'dom-i-sad': { icon: Sprout, color: 'bg-green-100', darkColor: 'dark:bg-green-900/20' },
    'remont-i-stroitelstvo': { icon: HardHat, color: 'bg-orange-100', darkColor: 'dark:bg-orange-900/20' },
    'elektronika': { icon: Smartphone, color: 'bg-red-100', darkColor: 'dark:bg-red-900/20' },
    'rabota': { icon: Briefcase, color: 'bg-emerald-100', darkColor: 'dark:bg-emerald-900/20' },
    'lichnye-veschi': { icon: Shirt, color: 'bg-violet-100', darkColor: 'dark:bg-violet-900/20' },
    'sport-i-hobbi': { icon: Trophy, color: 'bg-pink-100', darkColor: 'dark:bg-pink-900/20' },
    'zhivotnye': { icon: Dog, color: 'bg-lime-100', darkColor: 'dark:bg-lime-900/20' },
    'oborudovanie-dlya-biznesa': { icon: Truck, color: 'bg-amber-100', darkColor: 'dark:bg-amber-900/20' },
    'detskiy-mir': { icon: Baby, color: 'bg-cyan-100', darkColor: 'dark:bg-cyan-900/20' },
    'medtovary': { icon: Stethoscope, color: 'bg-rose-100', darkColor: 'dark:bg-rose-900/20' },
    'issyk-kul-2025': { icon: Map, color: 'bg-sky-100', darkColor: 'dark:bg-sky-900/20' },
    'nahodki-otdam-darom': { icon: Gift, color: 'bg-fuchsia-100', darkColor: 'dark:bg-fuchsia-900/20' },
};

export const getCategoryIcon = (slug: string) => {
    return categoryIcons[slug] || { icon: Home, color: 'bg-gray-100', darkColor: 'dark:bg-gray-800/50' };
};
