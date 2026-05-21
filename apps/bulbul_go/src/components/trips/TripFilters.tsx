'use client';

import * as React from 'react';
import { TripFilter, TripRole, TripType } from '@doska/shared';
import { 
    Tabs, 
    TabsList, 
    TabsTrigger,
    Button,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    Input
} from '@doska/ui';
import { 
    Search, 
    SlidersHorizontal, 
    MapPin, 
    Navigation,
    X,
    Car,
    User,
    Package
} from 'lucide-react';
import { RegionSelector } from './RegionSelector';
import { cn } from '@doska/shared';

interface TripFiltersProps {
    filters: TripFilter;
    onFilterChange: (filters: TripFilter) => void;
    onSearch: () => void;
    isLoading?: boolean;
}

export function TripFilters({ filters, onFilterChange, onSearch, isLoading }: TripFiltersProps) {
    const handleTypeChange = (type: string) => {
        onFilterChange({ 
            ...filters, 
            trip_type: type as TripType,
            from_location: undefined,
            to_location: undefined
        });
    };

    const handleRoleChange = (role: string) => {
        onFilterChange({ ...filters, role: role as TripRole });
    };

    const clearFilters = () => {
        onFilterChange({
            trip_type: filters.trip_type,
            role: filters.role,
        });
    };

    const hasActiveFilters = Boolean(
        filters.min_price || 
        filters.max_price || 
        filters.departure_date || 
        filters.pref_smoking_allowed ||
        filters.pref_baggage_allowed
    );

    return (
        <div className="flex flex-col gap-4 w-full bg-card p-4 md:p-6 rounded-[2.5rem] shadow-xl shadow-primary/5 transition-all">
            {/* Trip Type Tabs */}
            <Tabs 
                value={filters.trip_type || 'rideshare'} 
                onValueChange={handleTypeChange}
                className="w-full"
            >
                <TabsList className="grid grid-cols-2 h-11 p-1 bg-secondary/50 rounded-2xl w-full max-w-sm mx-auto md:mx-0">
                    <TabsTrigger value="rideshare" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        Межгород
                    </TabsTrigger>
                    <TabsTrigger value="rideshare_city" className="rounded-xl font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        По городу
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Role Tabs */}
            <Tabs 
                value={filters.role || 'driver'} 
                onValueChange={handleRoleChange}
                className="w-full"
            >
                <TabsList className="grid grid-cols-3 h-11 p-1 bg-secondary/50 rounded-2xl w-full transition-all">
                    <TabsTrigger value="driver" className="rounded-xl font-bold gap-2">
                        <Car className="h-4 w-4" />
                        <span className="hidden sm:inline">Водители</span>
                    </TabsTrigger>
                    <TabsTrigger value="passenger" className="rounded-xl font-bold gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Пассажиры</span>
                    </TabsTrigger>
                    <TabsTrigger value="parcel" className="rounded-xl font-bold gap-2">
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">Посылки</span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Location Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <RegionSelector
                    value={filters.from_location}
                    onChange={(id) => onFilterChange({ ...filters, from_location: id })}
                    placeholder="Откуда"
                    icon={<Navigation className="h-4 w-4 text-green-500" />}
                    leafOnly={filters.trip_type === 'rideshare_city'}
                />
                <RegionSelector
                    value={filters.to_location}
                    onChange={(id) => onFilterChange({ ...filters, to_location: id })}
                    placeholder="Куда"
                    icon={<MapPin className="h-4 w-4 text-red-500" />}
                    leafOnly={filters.trip_type === 'rideshare_city'}
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
                <Button 
                    onClick={onSearch} 
                    disabled={isLoading}
                    className="flex-1 h-12 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    {isLoading ? "Поиск..." : "Найти поездку"}
                </Button>
                
                <Sheet>
                    <SheetTrigger asChild>
                        <Button 
                            variant="secondary" 
                            className="h-12 w-12 shrink-0 rounded-2xl relative bg-secondary/80 hover:bg-secondary transition-all"
                        >
                            <SlidersHorizontal className="h-6 w-6" />
                            {hasActiveFilters && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-background" />
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-[2.5rem] h-[80vh] pt-10">
                        <SheetHeader className="px-1 items-center">
                            <SheetTitle className="text-2xl font-black">Фильтры</SheetTitle>
                        </SheetHeader>
                        
                        <div className="flex flex-col gap-8 mt-8 pb-10 max-w-lg mx-auto overflow-y-auto max-h-full">
                            {/* Price Section */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-lg">Цена (сом)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-muted-foreground ml-1">Мин.</label>
                                        <Input 
                                            type="number" 
                                            placeholder="0"
                                            value={filters.min_price || ''}
                                            onChange={(e) => onFilterChange({ ...filters, min_price: Number(e.target.value) || undefined })}
                                            className="h-12 rounded-2xl bg-secondary/50 border-none px-4 font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-muted-foreground ml-1">Макс.</label>
                                        <Input 
                                            type="number" 
                                            placeholder="5000"
                                            value={filters.max_price || ''}
                                            onChange={(e) => onFilterChange({ ...filters, max_price: Number(e.target.value) || undefined })}
                                            className="h-12 rounded-2xl bg-secondary/50 border-none px-4 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Date Section */}
                            <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-lg">Дата отправления</h4>
                                <Input 
                                    type="date"
                                    value={filters.departure_date || ''}
                                    onChange={(e) => onFilterChange({ ...filters, departure_date: e.target.value || undefined })}
                                    className="h-12 rounded-2xl bg-secondary/50 border-none px-4 font-bold"
                                />
                            </div>

                             {/* Preferences Section - Simplified for MVP */}
                             <div className="flex flex-col gap-4">
                                <h4 className="font-bold text-lg">Дополнительно</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { key: 'pref_smoking_allowed', label: 'Можно курить' },
                                        { key: 'pref_baggage_allowed', label: 'С багажом' },
                                        { key: 'pref_door_to_door', label: 'До двери' },
                                        { key: 'pref_takes_packages', label: 'Беру посылки' },
                                    ].map((pref) => (
                                        <Button
                                            key={pref.key}
                                            variant={filters[pref.key as keyof TripFilter] ? "default" : "outline"}
                                            onClick={() => onFilterChange({ 
                                                ...filters, 
                                                [pref.key]: filters[pref.key as keyof TripFilter] ? undefined : true 
                                            })}
                                            className="rounded-xl font-bold h-10 border-none bg-secondary/50 data-[state=active]:bg-primary"
                                            data-state={filters[pref.key as keyof TripFilter] ? "active" : "inactive"}
                                        >
                                            {pref.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Sticky Footer for Sheet */}
                            <div className="flex gap-3 mt-auto pt-4">
                                <Button 
                                    variant="ghost" 
                                    onClick={clearFilters}
                                    className="flex-1 h-12 rounded-2xl font-bold"
                                >
                                    Сбросить
                                </Button>
                                <Button 
                                    onClick={onSearch}
                                    className="flex-[2] h-12 rounded-2xl font-bold shadow-lg"
                                >
                                    Применить
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
