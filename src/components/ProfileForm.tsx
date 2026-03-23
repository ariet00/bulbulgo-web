'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateMe } from '@/hooks/mutations/useUserMutations';
import { useToastStore } from '@/store/useToastStore';
import { useTranslations } from 'next-intl';
import { User } from '@/types';
import { Loader2, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { requester } from '@/lib/requester';
import { useState } from 'react';

interface ProfileFormProps {
    user: User;
}

const profileSchema = z.object({
    username: z.string().min(2, 'Username must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    name: z.string().optional(),
    avatar: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileForm({ user }: ProfileFormProps) {
    const t = useTranslations('Account');
    const addMessage = useToastStore((state) => state.addMessage);
    const { mutateAsync: updateMe, isPending: saving } = useUpdateMe();
    const [uploading, setUploading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            name: user.data?.name || '',
            avatar: user.data?.avatar || '',
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        // Prepare payload with data field
        const payload = {
            ...data,
            data: {
                ...user.data,
                name: data.name,
                avatar: data.avatar,
            }
        };

        await updateMe(payload);
        addMessage({
            type: 'success',
            message: t('profileUpdated'),
            duration: 3000,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('editProfile')}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={watch('avatar')} />
                                <AvatarFallback className="text-lg">
                                    {user.username?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white h-8 w-8" />
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setUploading(true);
                                    try {
                                        const formData = new FormData();
                                        formData.append('file', file);

                                        const response = await requester.post('/upload/', formData, {
                                            headers: {
                                                'Content-Type': 'multipart/form-data',
                                            },
                                        });

                                        const url = response.data.url;
                                        setValue('avatar', url);
                                    } catch (error) {
                                        console.error('Upload failed', error);
                                        addMessage({
                                            type: 'error',
                                            message: 'Failed to upload image',
                                            duration: 3000,
                                        });
                                    } finally {
                                        setUploading(false);
                                    }
                                }}
                                disabled={uploading || saving}
                            />
                        </div>
                        {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            disabled={saving}
                            placeholder="Your full name"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="username">{t('username')}</Label>
                        <Input
                            id="username"
                            {...register('username')}
                            disabled={saving}
                        />
                        {errors.username && (
                            <p className="text-sm text-red-500">{errors.username.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input
                            id="email"
                            {...register('email')}
                            disabled={true}
                            className="bg-muted"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">{t('phone')}</Label>
                        <Input
                            id="phone"
                            {...register('phone')}
                            disabled={saving}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-500">{errors.phone.message}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {saving ? t('saving') : t('saveChanges')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
