import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-b-2 border-indigo-600 animate-spin" style={{ animationDelay: '-0.2s' }}></div>
      </div>
    </div>
  );
}