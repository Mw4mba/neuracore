'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload/ImageUpload';
import { Avatar } from '@/components/Avatar/Avatar';
import { useAvatarUpload } from '@/hooks/useImageUpload';
import { Loader2 } from 'lucide-react';

export interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  fallbackText?: string;
}

export function AvatarUpload({
  userId,
  currentAvatarUrl,
  onUploadSuccess,
  onUploadError,
  className = '',
  fallbackText,
}: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const displayUrl = previewUrl || currentAvatarUrl;

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleImageRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload avatar');
      }

      // Success
      if (onUploadSuccess) {
        onUploadSuccess(result.data.avatar_url);
      }

      // Clear selection
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      
      if (onUploadError && error instanceof Error) {
        onUploadError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsSubmitting(true);
    setUploadError(null);

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove avatar');
      }

      // Success - clear preview
      setPreviewUrl(null);
      setSelectedFile(null);

      if (onUploadSuccess) {
        onUploadSuccess('');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Remove failed';
      setUploadError(errorMessage);
      
      if (onUploadError && error instanceof Error) {
        onUploadError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Avatar Preview */}
      <div className="flex items-center gap-4">
        <Avatar
          src={displayUrl}
          fallbackText={fallbackText}
          size="xl"
          showBorder
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Profile Picture</h3>
          <p className="text-sm text-gray-600">
            Upload a new avatar or remove the current one
          </p>
        </div>
      </div>

      {/* Image Upload */}
      <ImageUpload
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        currentImageUrl={displayUrl || undefined}
        maxSize={5}
        accept="image/jpeg,image/png,image/gif,image/webp"
        disabled={isSubmitting}
        placeholder="Drop an avatar image here or click to browse"
        showPreview={false}
      />

      {/* Error Message */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isSubmitting}
          className="
            px-4 py-2 bg-blue-600 text-white rounded-lg font-medium
            hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors flex items-center gap-2
          "
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Uploading...' : 'Upload Avatar'}
        </button>

        {currentAvatarUrl && (
          <button
            onClick={handleRemoveAvatar}
            disabled={isSubmitting}
            className="
              px-4 py-2 bg-red-600 text-white rounded-lg font-medium
              hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Remove Avatar
          </button>
        )}
      </div>
    </div>
  );
}
