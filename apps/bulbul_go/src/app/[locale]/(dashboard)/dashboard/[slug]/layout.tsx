'use client';

import { useParams } from 'next/navigation';
import { Link, usePathname } from '@doska/i18n';
import { useCompany } from '@doska/shared';
import { cn } from '@doska/shared';
import {
    LayoutDashboard,
    Route,
    CalendarClock,
    Car,
    Users,
    UserCog,
} from 'lucide-react';
import CompanySelector from '../../../../../components/CompanySelector';

const NAV = [
    { key: '', label: 'Обзор', icon: LayoutDashboard },
    { key: '/trips', label: 'Поездки', icon: Route },
    { key: '/schedule', label: 'Расписание', icon: CalendarClock },
    { key: '/vehicles', label: 'Автопарк', icon: Car },
    { key: '/drivers', label: 'Водители', icon: Users },
    { key: '/employees', label: 'Сотрудники', icon: UserCog },
];

export default function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const slug = params?.slug as string;
    const pathname = usePathname();
    const { data: company } = useCompany(slug);

    const base = `/dashboard/${slug}`;

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{company?.name || 'Компания'}</h1>
                    <p className="text-sm text-muted-foreground">Панель управления перевозками</p>
                </div>
                <CompanySelector currentSlug={slug} />
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
                <nav className="flex gap-1 overflow-x-auto md:w-56 md:flex-col md:overflow-visible">
                    {NAV.map(({ key, label, icon: Icon }) => {
                        const href = `${base}${key}`;
                        const active = key === ''
                            ? pathname === base
                            : pathname.startsWith(href);
                        return (
                            <Link
                                key={key}
                                href={href}
                                className={cn(
                                    'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-muted',
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    );
}
