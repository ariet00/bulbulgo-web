import { useQuery } from '@tanstack/react-query';
import { getRegions } from '../../apis/regions';

export const useRegions = (leafOnly: boolean = false) => {
    return useQuery({
        queryKey: ['regions', leafOnly],
        queryFn: () => getRegions(leafOnly),
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};
