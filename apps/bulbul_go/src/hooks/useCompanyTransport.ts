import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { companyTransportApi } from '@/apis/companyTransport';
import {
    CompanyVehicleCreate, CompanyVehicleUpdate,
    DriverCreate, DriverUpdate,
    CompanyTripCreate, CompanyTripUpdate, CompanyTripFilters, TripAssignment,
} from '@/types/companyTransport';

export const TRANSPORT_KEYS = {
    all: ['company-transport'] as const,
    vehicles: (slug: string) => ['company-transport', 'vehicles', slug] as const,
    drivers: (slug: string) => ['company-transport', 'drivers', slug] as const,
    trips: (slug: string, filters?: CompanyTripFilters) =>
        ['company-transport', 'trips', slug, filters || {}] as const,
};

const errMsg = (e: any, fallback: string) =>
    e?.response?.data?.message || e?.response?.data?.detail || fallback;

// ── Queries ──
export const useCompanyVehicles = (slug: string) =>
    useQuery({ queryKey: TRANSPORT_KEYS.vehicles(slug), queryFn: () => companyTransportApi.getVehicles(slug), enabled: !!slug });

export const useCompanyVehicle = (slug: string, id: number) =>
    useQuery({ queryKey: [...TRANSPORT_KEYS.vehicles(slug), id], queryFn: () => companyTransportApi.getVehicle(slug, id), enabled: !!slug && !!id });

export const useCompanyDrivers = (slug: string) =>
    useQuery({ queryKey: TRANSPORT_KEYS.drivers(slug), queryFn: () => companyTransportApi.getDrivers(slug), enabled: !!slug });

export const useCompanyDriver = (slug: string, driverUserId: number) =>
    useQuery({ queryKey: [...TRANSPORT_KEYS.drivers(slug), driverUserId], queryFn: () => companyTransportApi.getDriver(slug, driverUserId), enabled: !!slug && !!driverUserId });

export const useCompanyTrips = (slug: string, filters: CompanyTripFilters = {}) =>
    useQuery({ queryKey: TRANSPORT_KEYS.trips(slug, filters), queryFn: () => companyTransportApi.getTrips(slug, filters), enabled: !!slug });

export const useCompanyTrip = (slug: string, id: number) =>
    useQuery({ queryKey: ['company-transport', 'trips', slug, 'detail', id], queryFn: () => companyTransportApi.getTrip(slug, id), enabled: !!slug && !!id });

// ── Vehicle mutations ──
export const useCreateVehicle = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyVehicleCreate) => companyTransportApi.createVehicle(slug, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: TRANSPORT_KEYS.vehicles(slug) }); toast.success('Машина добавлена'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось добавить машину')),
    });
};

export const useUpdateVehicle = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CompanyVehicleUpdate }) => companyTransportApi.updateVehicle(slug, id, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: TRANSPORT_KEYS.vehicles(slug) }); toast.success('Машина обновлена'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось обновить машину')),
    });
};

export const useDeleteVehicle = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => companyTransportApi.deleteVehicle(slug, id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: TRANSPORT_KEYS.vehicles(slug) }); toast.success('Машина удалена'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось удалить машину')),
    });
};

// ── Driver mutations ──
export const useCreateDriver = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: DriverCreate) => companyTransportApi.createDriver(slug, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: TRANSPORT_KEYS.drivers(slug) }); toast.success('Водитель добавлен'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось добавить водителя')),
    });
};

export const useUpdateDriver = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ driverUserId, data }: { driverUserId: number; data: DriverUpdate }) => companyTransportApi.updateDriver(slug, driverUserId, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: TRANSPORT_KEYS.drivers(slug) }); toast.success('Водитель обновлён'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось обновить водителя')),
    });
};

export const useDeleteDriver = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (driverUserId: number) => companyTransportApi.deleteDriver(slug, driverUserId),
        onSuccess: () => { qc.invalidateQueries({ queryKey: TRANSPORT_KEYS.drivers(slug) }); toast.success('Водитель удалён'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось удалить водителя')),
    });
};

// ── Trip mutations ──
export const useCreateCompanyTrip = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CompanyTripCreate) => companyTransportApi.createTrip(slug, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-transport', 'trips', slug] }); toast.success('Поездка создана'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось создать поездку')),
    });
};

export const useUpdateCompanyTrip = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CompanyTripUpdate }) => companyTransportApi.updateTrip(slug, id, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-transport', 'trips', slug] }); toast.success('Поездка обновлена'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось обновить поездку')),
    });
};

export const useAssignTripDriverVehicle = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TripAssignment }) => companyTransportApi.assignTrip(slug, id, data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-transport', 'trips', slug] }); toast.success('Назначение обновлено'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось обновить назначение')),
    });
};

export const useDeleteCompanyTrip = (slug: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => companyTransportApi.deleteTrip(slug, id),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['company-transport', 'trips', slug] }); toast.success('Поездка удалена'); },
        onError: (e: any) => toast.error(errMsg(e, 'Не удалось удалить поездку')),
    });
};
