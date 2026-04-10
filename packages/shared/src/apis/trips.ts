import { requester } from '../lib/requester';
import { Trip, TripFilter } from '../types';

export const getTrips = async (params: TripFilter = {}): Promise<Trip[]> => {
    const response = await requester.get('/trips/', { params });
    return response.data;
};

export const getTrip = async (id: number): Promise<Trip> => {
    const response = await requester.get(`/trips/${id}`);
    return response.data;
};

export const getTripPhone = async (id: number, role?: string): Promise<string> => {
    const response = await requester.get(`/trips/${id}/contact`, {
        params: { role }
    });
    return response.data;
};
