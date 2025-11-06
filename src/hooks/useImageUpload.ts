'use client';

import { useState } from 'react';
import {
  uploadImage,
  uploadAvatar,
  uploadIdeaCover,
  deleteImage,
  validateImage,
  type ImageUploadOptions,
  type ImageUploadResult,
} from '@/lib/storage/image-upload';

export interface UseImageUploadOptions extends ImageUploadOptions {
  onSuccess?: (result: ImageUploadResult) => void;
  onError?: (error: Error) => void;
}

export interface UseImageUploadReturn {
  upload: (file: File) => Promise<ImageUploadResult | null>;
  deleteFile: (filePath: string) => Promise<void>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: ImageUploadResult | null;
  reset: () => void;
}

/**
 * React hook for handling image uploads with loading states
 */
export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageUploadResult | null>(null);

  const upload = async (file: File): Promise<ImageUploadResult | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      // Validate before upload
      const validationError = validateImage(file, options);
      if (validationError) {
        throw new Error(validationError);
      }

      setProgress(30);

      // Upload image
      const uploadResult = await uploadImage(file, options);
      
      setProgress(100);
      setResult(uploadResult);
      
      // Call success callback
      if (options.onSuccess) {
        options.onSuccess(uploadResult);
      }

      return uploadResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      
      // Call error callback
      if (options.onError && err instanceof Error) {
        options.onError(err);
      }

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (filePath: string): Promise<void> => {
    try {
      await deleteImage(filePath, options.bucket);
      setResult(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw err;
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  };

  return {
    upload,
    deleteFile,
    isUploading,
    progress,
    error,
    result,
    reset,
  };
}

/**
 * Hook specifically for avatar uploads
 */
export function useAvatarUpload(
  userId: string,
  options: Omit<UseImageUploadOptions, 'bucket' | 'folder'> = {}
): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageUploadResult | null>(null);

  const upload = async (file: File): Promise<ImageUploadResult | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(30);
      const uploadResult = await uploadAvatar(file, userId);
      setProgress(100);
      setResult(uploadResult);
      
      if (options.onSuccess) {
        options.onSuccess(uploadResult);
      }

      return uploadResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      
      if (options.onError && err instanceof Error) {
        options.onError(err);
      }

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (filePath: string): Promise<void> => {
    try {
      await deleteImage(filePath);
      setResult(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw err;
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  };

  return {
    upload,
    deleteFile,
    isUploading,
    progress,
    error,
    result,
    reset,
  };
}

/**
 * Hook specifically for idea cover image uploads
 */
export function useIdeaCoverUpload(
  options: Omit<UseImageUploadOptions, 'bucket' | 'folder'> = {}
): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageUploadResult | null>(null);

  const upload = async (file: File): Promise<ImageUploadResult | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setProgress(30);
      const uploadResult = await uploadIdeaCover(file);
      setProgress(100);
      setResult(uploadResult);
      
      if (options.onSuccess) {
        options.onSuccess(uploadResult);
      }

      return uploadResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      
      if (options.onError && err instanceof Error) {
        options.onError(err);
      }

      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (filePath: string): Promise<void> => {
    try {
      await deleteImage(filePath);
      setResult(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw err;
    }
  };

  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  };

  return {
    upload,
    deleteFile,
    isUploading,
    progress,
    error,
    result,
    reset,
  };
}
