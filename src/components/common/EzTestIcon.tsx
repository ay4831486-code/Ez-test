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
      
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={`${currentSize} rounded-[inherit] relative z-10 shadow-lg text-blue-500 bg-slate-900 p-1`}
      >
        <path d="M21.42 10.922a2 2 0 0 0-.019-3.838L12.83 4.32a2 2 0 0 0-1.66 0L2.6 7.08a2 2 0 0 0 0 3.84l8.57 3.65a2 2 0 0 0 1.66 0z"/>
        <path d="M22 10v6"/>
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
      </svg>
    </div>
  );
}
