/**
 * Image Upload Utility
 * Handles image uploads to Supabase Storage with validation and optimization
 */

import { createClient } from '@/app/lib/supabase/client';

export interface ImageUploadOptions {
  bucket?: string;
  folder?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
}

export interface ImageUploadResult {
  url: string;
  path: string;
  thumbnailUrl?: string;
}

const DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
  bucket: 'Image+posts',
  folder: '',
  maxSizeInMB: 10,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  generateThumbnail: false,
};

/**
 * Validates an image file
 */
export function validateImage(file: File, options: ImageUploadOptions = {}): string | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Check file type
  if (!opts.allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${opts.allowedTypes.join(', ')}`;
  }

  // Check file size
  const maxSizeInBytes = opts.maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return `File size exceeds ${opts.maxSizeInMB}MB limit`;
  }

  return null;
}

/**
 * Generates a unique file path for storage
 */
export function generateFilePath(file: File, folder: string = ''): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
  
  const fileName = `${timestamp}_${randomString}_${sanitizedName}`;
  
  return folder ? `${folder}/${fileName}` : fileName;
}

/**
 * Uploads an image to Supabase Storage
 */
export async function uploadImage(
  file: File,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Validate image
  const validationError = validateImage(file, opts);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = createClient();
  const filePath = generateFilePath(file, opts.folder);

  // Upload to storage
  const { data, error } = await supabase.storage
    .from(opts.bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(opts.bucket)
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

/**
 * Deletes an image from Supabase Storage
 */
export async function deleteImage(
  filePath: string,
  bucket: string = 'Image+posts'
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Extracts file path from a Supabase Storage URL
 */
export function extractFilePathFromUrl(url: string, bucket: string = 'Image+posts'): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf(bucket);
    
    if (bucketIndex === -1) {
      return null;
    }
    
    return pathParts.slice(bucketIndex + 1).join('/');
  } catch (error) {
    console.error('Error extracting file path:', error);
    return null;
  }
}

/**
 * Uploads an avatar image
 */
export async function uploadAvatar(file: File, userId: string): Promise<ImageUploadResult> {
  return uploadImage(file, {
    bucket: 'Image+posts',
    folder: `avatars/${userId}`,
    maxSizeInMB: 5,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  });
}

/**
 * Uploads an idea cover image
 */
export async function uploadIdeaCover(file: File): Promise<ImageUploadResult> {
  return uploadImage(file, {
    bucket: 'Image+posts',
    folder: 'idea-covers',
    maxSizeInMB: 10,
  });
}

/**
 * Uploads an achievement icon
 */
export async function uploadAchievementIcon(file: File): Promise<ImageUploadResult> {
  return uploadImage(file, {
    bucket: 'Image+posts',
    folder: 'achievement-icons',
    maxSizeInMB: 2,
    allowedTypes: ['image/png', 'image/svg+xml', 'image/webp'],
  });
}
