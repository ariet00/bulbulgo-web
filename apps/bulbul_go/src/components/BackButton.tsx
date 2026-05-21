'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@doska/ui';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BackButton() {
    const router = useRouter();
    const t = useTranslations('Common');

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <Button
            variant="ghost"
            className="mb-6 pl-0 hover:bg-transparent hover:text-primary cursor-pointer"
            onClick={handleBack}
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
        </Button>
    );
}
