'use client';

import Image from 'next/image';
import { User } from 'lucide-react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: AvatarSize;
  className?: string;
  fallbackText?: string;
  showBorder?: boolean;
}

const sizeClasses: Record<AvatarSize, { wrapper: string; icon: number; text: string }> = {
  xs: { wrapper: 'w-6 h-6', icon: 12, text: 'text-xs' },
  sm: { wrapper: 'w-8 h-8', icon: 16, text: 'text-sm' },
  md: { wrapper: 'w-10 h-10', icon: 20, text: 'text-base' },
  lg: { wrapper: 'w-16 h-16', icon: 32, text: 'text-xl' },
  xl: { wrapper: 'w-24 h-24', icon: 48, text: 'text-3xl' },
};

export function Avatar({
  src,
  alt = 'User avatar',
  size = 'md',
  className = '',
  fallbackText,
  showBorder = false,
}: AvatarProps) {
  const { wrapper, icon, text } = sizeClasses[size];
  const borderClass = showBorder ? 'ring-2 ring-white ring-offset-2' : '';

  // Show image if src is provided and valid
  if (src) {
    return (
      <div className={`${wrapper} rounded-full overflow-hidden relative ${borderClass} ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`${icon * 2}px`}
          onError={(e) => {
            // Hide image on error (will show fallback)
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Show fallback text initial if provided
  if (fallbackText) {
    const initial = fallbackText.charAt(0).toUpperCase();
    return (
      <div
        className={`
          ${wrapper} rounded-full flex items-center justify-center
          bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold
          ${borderClass} ${text} ${className}
        `}
      >
        {initial}
      </div>
    );
  }

  // Show default user icon
  return (
    <div
      className={`
        ${wrapper} rounded-full flex items-center justify-center
        bg-gray-200 text-gray-500
        ${borderClass} ${className}
      `}
    >
      <User size={icon} />
    </div>
  );
}
