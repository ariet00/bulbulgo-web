"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserStatistics } from "@/apis/statistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, FileText, Calendar, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileStatisticsProps {
    userId: number;
}

export function ProfileStatistics({ userId }: ProfileStatisticsProps) {
    const t = useTranslations("ProfileStatistics");
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ["userStatistics", userId],
        queryFn: () => getUserStatistics(userId),
    });

    if (isLoading) {
        return <ProfileStatisticsSkeleton />;
    }

    if (error || !stats) {
        return null;
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{t("registered")}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(stats.registration_date)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{t("totalAds")}</p>
                        <p className="text-sm text-muted-foreground">{stats.total_ads_count}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{t("activeAds")}</p>
                        <p className="text-sm text-muted-foreground">{stats.active_ads_count}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{t("totalViews")}</p>
                        <p className="text-sm text-muted-foreground">{stats.total_views_count}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ProfileStatisticsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-[60px]" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
