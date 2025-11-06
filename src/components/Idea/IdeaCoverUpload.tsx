'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload/ImageUpload';

export interface IdeaCoverUploadProps {
  onCoverSelect: (file: File) => void;
  onCoverRemove?: () => void;
  currentCoverUrl?: string;
  className?: string;
}

export function IdeaCoverUpload({
  onCoverSelect,
  onCoverRemove,
  currentCoverUrl,
  className = '',
}: IdeaCoverUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setError(null);
    onCoverSelect(file);
  };

  const handleImageRemove = () => {
    setError(null);
    if (onCoverRemove) {
      onCoverRemove();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image <span className="text-gray-400">(Optional)</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload a cover image to make your idea stand out. Recommended size: 1200x630px
        </p>
      </div>

      <ImageUpload
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        currentImageUrl={currentCoverUrl}
        maxSize={10}
        accept="image/jpeg,image/png,image/gif,image/webp"
        placeholder="Drop a cover image here or click to browse (max 10MB)"
        showPreview={true}
        previewClassName="aspect-[1200/630]"
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <svg
          className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Tips for great cover images:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>Use high-quality, relevant images</li>
            <li>Ensure text is readable if present</li>
            <li>Avoid images with excessive text</li>
            <li>Landscape orientation works best</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
