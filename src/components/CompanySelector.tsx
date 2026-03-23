'use client';

import { Check, ChevronsUpDown, PlusCircle, Building2 as CompanyIcon, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMyCompanies } from '@/hooks/queries/useCompany';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CompanySelectorProps {
    className?: string;
    currentSlug?: string;
}

export default function CompanySelector({ className, currentSlug }: CompanySelectorProps) {
    const router = useRouter();
    const { data: companies = [] } = useMyCompanies();
    const t = useTranslations('Company');

    const currentCompany = companies.find((company) => company.slug === currentSlug);

    const onCompanySelect = (slug: string) => {
        router.push(`/dashboard/${slug}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn("w-[200px] justify-between", className)}
                >
                    {currentCompany ? (
                        <div className="flex items-center gap-2 truncate">
                            <Avatar className="h-5 w-5">
                                <AvatarImage src={currentCompany.data?.logo} alt={currentCompany.name} />
                                <AvatarFallback><CompanyIcon className="h-3 w-3" /></AvatarFallback>
                            </Avatar>
                            <span className="truncate">{currentCompany.name}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <CompanyIcon className="h-4 w-4" />
                            <span>{t('selectCompany') || 'Select Company'}</span>
                        </div>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>{t('myCompanies') || 'My Companies'}</DropdownMenuLabel>
                    {companies.length === 0 && (
                        <div className="px-2 py-2 text-sm text-muted-foreground">
                            {t('noCompaniesFound') || 'No companies found.'}
                        </div>
                    )}
                    {companies.map((company) => (
                        <DropdownMenuItem
                            key={company.slug}
                            onSelect={() => onCompanySelect(company.slug)}
                            className="cursor-pointer"
                        >
                            <Avatar className="mr-2 h-5 w-5">
                                <AvatarImage src={company.data?.logo} alt={company.name} />
                                <AvatarFallback><CompanyIcon className="h-3 w-3" /></AvatarFallback>
                            </Avatar>
                            <span className="truncate flex-1">{company.name}</span>
                            {currentSlug === company.slug && (
                                <Check className="ml-auto h-4 w-4" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onSelect={() => router.push('/my-companies')}
                        className="cursor-pointer"
                    >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {t('manageCompanies') || 'Manage Companies'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => router.push('/company/create')}
                        className="cursor-pointer"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t('createCompany') || 'Create Company'}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
