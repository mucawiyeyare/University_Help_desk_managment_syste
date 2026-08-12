import React from 'react';

export default function Spinner({ size = 'md', fullScreen = false }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div
      className={`${sizeMap[size]} border-indigo-500 border-t-transparent rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-[400px] w-full flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
