import { requester } from "../lib/requester";

export interface UserStatistics {
    user_id: number;
    registration_date: string;
    total_companies_count: number;
    total_trips_count: number;
    total_views_count: number;
}

export interface CompanyStatistics {
    company_id: number;
    views_count: number;
    reviews_count: number;
    rating: number | null;
}

export const getUserStatistics = async (userId: number): Promise<UserStatistics> => {
    const { data } = await requester.get<UserStatistics>(`/statistics/user/${userId}`);
    return data;
};

export const getCompanyStatistics = async (companyId: number): Promise<CompanyStatistics> => {
    const { data } = await requester.get<CompanyStatistics>(`/statistics/company/${companyId}`);
    return data;
};
