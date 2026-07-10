'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  showStatus?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

const dotSizeMap = {
  sm: 'h-2.5 w-2.5 ring-1',
  md: 'h-3 w-3 ring-2',
  lg: 'h-3.5 w-3.5 ring-2',
  xl: 'h-4 w-4 ring-2',
};

export default function Avatar({
  src,
  name,
  size = 'md',
  isOnline,
  showStatus = false,
  className,
}: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover',
            sizeMap[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-primary/20 flex items-center justify-center font-semibold text-primary',
            sizeMap[size]
          )}
        >
          {initials}
        </div>
      )}

      {showStatus && isOnline !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-dark-bg',
            dotSizeMap[size],
            isOnline ? 'bg-green-500' : 'bg-gray-500'
          )}
        />
      )}
    </div>
  );
}
