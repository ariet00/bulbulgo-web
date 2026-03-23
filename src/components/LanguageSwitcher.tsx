"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const handleValueChange = (nextLocale: string) => {
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <Select
            value={locale}
            onValueChange={handleValueChange}
            disabled={isPending}
        >
            <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
            </SelectContent>
        </Select>
    );
}
