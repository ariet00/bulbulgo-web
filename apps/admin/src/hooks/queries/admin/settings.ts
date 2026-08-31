import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/apis/admin'
import { adminKeys } from './keys'

export const useAdminCeleryTasks = () => {
    return useQuery({
        queryKey: adminKeys.celeryTasks(),
        queryFn: () => adminApi.listCeleryTasks(),
    })
}

export const useAdminCeleryTask = (id: number) => {
    return useQuery({
        queryKey: adminKeys.celeryTask(id),
        queryFn: () => adminApi.getCeleryTask(id),
        enabled: !!id,
    })
}

export const useAdminAppVersionSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'version'] as const,
        queryFn: () => adminApi.getAppVersionSettings(),
    })
}

export const useAdminMaintenanceSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'maintenance'] as const,
        queryFn: () => adminApi.getMaintenanceSettings(),
    })
}

export const useAdminAppFeaturesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'features'] as const,
        queryFn: () => adminApi.getAppFeaturesSettings(),
    })
}

export const useAdminContactLimitsSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'contact-limits'] as const,
        queryFn: () => adminApi.getContactLimitsSettings(),
    })
}

export const useAdminBumpLimitsSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'bump-limits'] as const,
        queryFn: () => adminApi.getBumpLimitsSettings(),
    })
}

export const useAdminTripCreateRulesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'trip-create-rules'] as const,
        queryFn: () => adminApi.getTripCreateRulesSettings(),
    })
}

export const useAdminActiveLimitsSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'active-limits'] as const,
        queryFn: () => adminApi.getActiveLimitsSettings(),
    })
}

export const useAdminSubscriptionSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'subscriptions'] as const,
        queryFn: () => adminApi.getSubscriptionSettings(),
    })
}

export const useAdminPhoneViewSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'phone-views'] as const,
        queryFn: () => adminApi.getPhoneViewSettings(),
    })
}

export const useAdminServicePricesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'service-prices'] as const,
        queryFn: () => adminApi.getServicePricesSettings(),
    })
}

export const useAdminParcelTypesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'parcel-types'] as const,
        queryFn: () => adminApi.getParcelTypesSettings(),
    })
}

export const useAdminFreightCargoTypesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'freight-cargo-types'] as const,
        queryFn: () => adminApi.getFreightCargoTypesSettings(),
    })
}

export const useAdminSupportSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'support'] as const,
        queryFn: () => adminApi.getSupportSettings(),
    })
}

export const useAdminQuickMessages = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'quick-messages'] as const,
        queryFn: () => adminApi.getQuickMessages(),
    })
}

export const useAdminAttractivePricesSettings = () => {
    return useQuery({
        queryKey: [...adminKeys.appSettings(), 'attractive-prices'] as const,
        queryFn: () => adminApi.getAttractivePricesSettings(),
    })
}
