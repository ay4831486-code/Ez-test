import React from 'react';

interface EzTestIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function EzTestIcon({ size = 'md', className = '' }: EzTestIconProps) {
  // Determine dimensions based on size
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`relative group inline-flex items-center justify-center select-none ${className}`}>
      {/* Outer ambient glow shadow */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-[inherit] blur-xs opacity-25 group-hover:opacity-40 transition duration-500" />
      
      <img 
        src="/icon.svg" 
        alt="EZ Logo" 
        className={`${currentSize} rounded-[inherit] relative z-10 shadow-lg`} 
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = '/icon-192.png';
        }}
      />
    </div>
  );
}
