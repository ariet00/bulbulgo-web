import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMe } from '../../apis/users';

export const useUpdateMe = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMe,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        },
    });
};
