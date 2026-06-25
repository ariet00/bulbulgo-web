'use client';

import { useParams } from 'next/navigation';
import { Link } from '@doska/i18n';
import {
    useCompanyVehicles,
    useCompanyDrivers,
    useCompanyTrips,
} from '@/hooks/useCompanyTransport';
import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui';
import { Route, Car, Users } from 'lucide-react';

export default function CompanyOverviewPage() {
    const { slug } = useParams() as { slug: string };
    const { data: vehicles = [] } = useCompanyVehicles(slug);
    const { data: drivers = [] } = useCompanyDrivers(slug);
    const { data: trips = [] } = useCompanyTrips(slug, { status: 'active' });

    const cards = [
        { label: 'Активные поездки', value: trips.length, icon: Route, href: `/dashboard/${slug}/trips` },
        { label: 'Машины', value: vehicles.length, icon: Car, href: `/dashboard/${slug}/vehicles` },
        { label: 'Водители', value: drivers.length, icon: Users, href: `/dashboard/${slug}/drivers` },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ label, value, icon: Icon, href }) => (
                <Link key={label} href={href}>
                    <Card className="transition-colors hover:border-primary">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {label}
                            </CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{value}</div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
