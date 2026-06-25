import { useMutation } from '@tanstack/react-query';
import { uploadFile } from '../../apis/upload';

export const useUploadFile = (isPublic = false) => {
    return useMutation({
        mutationFn: (formData: FormData) => uploadFile(formData, isPublic),
    });
};
