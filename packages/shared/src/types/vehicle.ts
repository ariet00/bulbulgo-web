export interface Vehicle {
    id: number;
    user_id: number;
    brand: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
    data?: {
        images?: Array<{
            url: string;
            id: string;
        }>;
        [key: string]: any;
    };
    created_at: string;
    updated_at: string;
}
