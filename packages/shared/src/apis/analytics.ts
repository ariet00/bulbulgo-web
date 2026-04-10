import { requester } from "../lib/requester";

export interface AnalyticsEventCreate {
    event_type: string;
    company_id?: number;
    user_id?: number;
}

export const trackEvent = async (event: AnalyticsEventCreate): Promise<boolean> => {
    try {
        await requester.post("/analytics/event", event);
        return true;
    } catch (error) {
        console.error("Failed to track event:", error);
        return false;
    }
};