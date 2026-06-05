import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ src, alt = '', name, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt || name || ''}
        className={`rounded-full object-cover ${sizeStyles[size]} ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium ${sizeStyles[size]} ${className}`}
      title={name}
    >
      {name ? getInitials(name) : '?'}
    </div>
  );
}

export function AvatarImage({ src, alt = '' }: { src: string; alt?: string }) {
  return <img src={src} alt={alt} />;
}

export function AvatarFallback({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
