'use client';

import { UserPublic } from '@doska/shared';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ru } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface UserActivityMetricsProps {
    user: UserPublic;
    className?: string;
}

export function UserActivityMetrics({ user, className }: UserActivityMetricsProps) {
    const t = useTranslations('UserActivity');
    const locale = useLocale();

    const dateLocale = locale === 'ru' ? ru : enUS;

    const isOnline = user.last_online_at &&
        (new Date().getTime() - new Date(user.last_online_at).getTime()) < 5 * 60 * 1000;

    return (
        <div className={`space-y-2 text-sm text-muted-foreground ${className}`}>
            {/* Online Status */}
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>
                    {isOnline
                        ? t('online')
                        : user.last_online_at
                            ? t('lastSeen', { time: formatDistanceToNow(new Date(user.last_online_at), { addSuffix: true, locale: dateLocale }) })
                            : t('offline')
                    }
                </span>
            </div>

            {/* Response Time */}
            {user.data?.response_time_minutes !== undefined && user.data?.response_time_minutes !== null && (
                <div>
                    {t('avgResponseTime')}: <span className="font-medium text-foreground">
                        {user.data.response_time_minutes < 60
                            ? t('minutes', { count: user.data.response_time_minutes })
                            : t('hours', { count: Math.round(user.data.response_time_minutes / 60) })
                        }
                    </span>
                </div>
            )}

            {/* Response Rate */}
            {user.data?.response_rate_percent !== undefined && user.data?.response_rate_percent !== null && (
                <div>
                    {t('responseRate')}: <span className="font-medium text-foreground">{user.data.response_rate_percent}%</span>
                </div>
            )}
        </div>
    );
}
