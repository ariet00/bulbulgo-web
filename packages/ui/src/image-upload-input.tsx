"use client";

import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@doska/shared';
import { toast } from 'sonner';

interface ImageUploadInputProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    previewClassName?: string;
}

export function ImageUploadInput({
    value,
    onChange,
    placeholder = 'https://...',
    disabled,
    className,
    previewClassName,
}: ImageUploadInputProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const result = await uploadFile(formData);
            onChange(result.url);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
            // Reset input so the same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClear = () => {
        onChange('');
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled || isUploading}
                        className="pr-10"
                    />
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={disabled || isUploading}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled || isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload image"
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {value && (
                <div className={`relative bg-muted overflow-hidden border ${previewClassName || 'w-full h-40 rounded-md'}`}>
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = ''; // Clear broken src
                            // You might want to show a fallback icon here instead of just clearing
                        }}
                    />
                    {!value && (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 opacity-50" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
