import { requester } from '../lib/requester';
import { Region } from '../types';

export const getRegions = async (leafOnly: boolean = false): Promise<Region[]> => {
    const response = await requester.get('/regions/', {
        params: { leaf_only: leafOnly }
    });
    return response.data;
};
