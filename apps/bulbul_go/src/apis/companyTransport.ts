import { requester } from '@doska/shared';
import {
    CompanyVehicle, CompanyVehicleCreate, CompanyVehicleUpdate,
    Driver, DriverCreate, DriverUpdate,
    CompanyTrip, CompanyTripCreate, CompanyTripUpdate, CompanyTripFilters, TripAssignment,
} from '@/types/companyTransport';

const base = (slug: string) => `/companies/${slug}`;

export const companyTransportApi = {
    // ── Vehicles ──
    getVehicles: async (slug: string): Promise<CompanyVehicle[]> => {
        const res = await requester.get(`${base(slug)}/vehicles`);
        return res.data;
    },
    getVehicle: async (slug: string, id: number): Promise<CompanyVehicle> => {
        const res = await requester.get(`${base(slug)}/vehicles/${id}`);
        return res.data;
    },
    createVehicle: async (slug: string, data: CompanyVehicleCreate): Promise<CompanyVehicle> => {
        const res = await requester.post(`${base(slug)}/vehicles`, data);
        return res.data;
    },
    updateVehicle: async (slug: string, id: number, data: CompanyVehicleUpdate): Promise<CompanyVehicle> => {
        const res = await requester.put(`${base(slug)}/vehicles/${id}`, data);
        return res.data;
    },
    deleteVehicle: async (slug: string, id: number): Promise<void> => {
        await requester.delete(`${base(slug)}/vehicles/${id}`);
    },

    // ── Drivers ──
    getDrivers: async (slug: string): Promise<Driver[]> => {
        const res = await requester.get(`${base(slug)}/drivers`);
        return res.data;
    },
    getDriver: async (slug: string, driverUserId: number): Promise<Driver> => {
        const res = await requester.get(`${base(slug)}/drivers/${driverUserId}`);
        return res.data;
    },
    createDriver: async (slug: string, data: DriverCreate): Promise<Driver> => {
        const res = await requester.post(`${base(slug)}/drivers`, data);
        return res.data;
    },
    updateDriver: async (slug: string, driverUserId: number, data: DriverUpdate): Promise<Driver> => {
        const res = await requester.put(`${base(slug)}/drivers/${driverUserId}`, data);
        return res.data;
    },
    deleteDriver: async (slug: string, driverUserId: number): Promise<void> => {
        await requester.delete(`${base(slug)}/drivers/${driverUserId}`);
    },

    // ── Trips ──
    getTrips: async (slug: string, filters: CompanyTripFilters = {}): Promise<CompanyTrip[]> => {
        const res = await requester.get(`${base(slug)}/trips`, { params: filters });
        return res.data;
    },
    getTrip: async (slug: string, id: number): Promise<CompanyTrip> => {
        const res = await requester.get(`${base(slug)}/trips/${id}`);
        return res.data;
    },
    createTrip: async (slug: string, data: CompanyTripCreate): Promise<CompanyTrip> => {
        const res = await requester.post(`${base(slug)}/trips`, data);
        return res.data;
    },
    updateTrip: async (slug: string, id: number, data: CompanyTripUpdate): Promise<CompanyTrip> => {
        const res = await requester.put(`${base(slug)}/trips/${id}`, data);
        return res.data;
    },
    assignTrip: async (slug: string, id: number, data: TripAssignment): Promise<CompanyTrip> => {
        const res = await requester.patch(`${base(slug)}/trips/${id}/assignment`, data);
        return res.data;
    },
    deleteTrip: async (slug: string, id: number): Promise<void> => {
        await requester.delete(`${base(slug)}/trips/${id}`);
    },
};
