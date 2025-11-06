'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  currentImageUrl?: string;
  maxSize?: number; // in MB
  accept?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  previewClassName?: string;
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  currentImageUrl,
  maxSize = 10,
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  disabled = false,
  className = '',
  placeholder = 'Drop an image here or click to browse',
  showPreview = true,
  previewClassName = '',
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = previewUrl || currentImageUrl;

  const validateFile = (file: File): string | null => {
    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    
    if (!acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', ''));
      }
      return fileType === type;
    })) {
      return 'Invalid file type. Please select an image file.';
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Call parent callback
    onImageSelect(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${error ? 'border-red-500' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        {showPreview && displayUrl ? (
          <div className={`relative aspect-video w-full ${previewClassName}`}>
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className={`
              p-4 rounded-full mb-4 transition-colors
              ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}
            `}>
              {isDragging ? (
                <Upload className="w-8 h-8 text-blue-500" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {isDragging ? 'Drop image here' : placeholder}
            </p>
            <p className="text-xs text-gray-400">
              Maximum size: {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
