'use client';

import * as React from 'react';
import { TripFilters } from '@/components/trips/TripFilters';
import { TripCard } from '@/components/trips/TripCard';
import { useTrips } from '@doska/shared';
import { TripFilter, TripType, TripRole } from '@doska/shared';
import { Button, Skeleton } from '@doska/ui';
import { SearchX, Plus, RefreshCw } from 'lucide-react';
import { Link } from '@doska/i18n';

export default function HomePage() {
    const [filters, setFilters] = React.useState<TripFilter>({
        trip_type: 'rideshare',
        role: 'driver',
        limit: 20,
        skip: 0
    });

    const { data: trips, isLoading, isError, refetch, isFetching } = useTrips(filters);

    const handleSearch = () => {
        refetch();
    };

    const handleFilterChange = (newFilters: TripFilter) => {
        setFilters(newFilters);
    };

    return (
        <div className="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
            <div className="flex flex-col gap-8">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Куда поедем?
                        </h1>
                        <p className="text-muted-foreground font-medium mt-2">
                            Найдите попутчиков или водителя для вашей следующей поездки
                        </p>
                    </div>
                    <Button asChild size="lg" className="rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <Link href="/trips/create">
                            <Plus className="h-5 w-5" />
                            Создать поездку
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <TripFilters 
                    filters={filters} 
                    onFilterChange={handleFilterChange} 
                    onSearch={handleSearch}
                    isLoading={isFetching}
                />

                {/* Result Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black">
                            {isLoading ? "Поиск..." : trips?.length ? "Найдено" : "Результаты"}
                            {trips?.length ? ` (${trips.length})` : ""}
                        </h2>
                        {isError && (
                            <Button variant="ghost" onClick={() => refetch()} className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Повторить
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-64 rounded-[2.5rem]" />
                            ))}
                        </div>
                    ) : trips && trips.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {trips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-card/50 rounded-[2.5rem] border border-dashed text-center px-4">
                            <div className="bg-secondary/50 p-6 rounded-full mb-6">
                                <SearchX className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Поездок не найдено</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Попробуйте изменить параметры поиска или создайте свое объявление
                            </p>
                            <Button variant="outline" onClick={() => setFilters({ trip_type: 'rideshare', role: 'driver' })} className="mt-6 rounded-xl">
                                Сбросить всё
                            </Button>
                        </div>
                    )}

                    {/* Simple pagination / Load more */}
                    {trips && trips.length >= (filters.limit || 20) && (
                        <div className="flex justify-center mt-4">
                            <Button 
                                variant="outline" 
                                className="rounded-2xl px-10 font-bold"
                                onClick={() => setFilters({ ...filters, limit: (filters.limit || 20) + 20 })}
                            >
                                Показать ещё
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
