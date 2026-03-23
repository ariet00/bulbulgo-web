import { useMutation } from '@tanstack/react-query';
import { uploadFile } from '@/apis/upload';

export const useUploadFile = () => {
    return useMutation({
        mutationFn: uploadFile,
    });
};
