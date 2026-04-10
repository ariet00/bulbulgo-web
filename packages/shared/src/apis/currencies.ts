import { requester } from '../lib/requester';

export interface Currency {
    id: number;
    code: string;
    symbol: string;
    name: string;
}

export const getCurrencies = async (): Promise<Currency[]> => {
    const response = await requester.get('/currencies/');
    return response.data;
};
