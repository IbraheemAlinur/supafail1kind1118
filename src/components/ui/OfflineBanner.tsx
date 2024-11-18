import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  message?: string;
  onRetry?: () => void;
  retryAttempt?: number;
}

export default function OfflineBanner({ 
  message = 'You are currently offline. Some features may be limited.', 
  onRetry,
  retryAttempt = 0 
}: OfflineBannerProps) {
  return (
    <div className="bg-yellow-50 border-b border-yellow-100">
      <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex-1 flex items-center">
            <WifiOff className="h-5 w-5 text-yellow-600" />
            <p className="ml-3 font-medium text-yellow-700 truncate">
              <span className="inline">{message}</span>
            </p>
          </div>
          {onRetry && (
            <div className="flex-shrink-0 order-2 sm:order-3 sm:ml-3">
              <button
                onClick={onRetry}
                type="button"
                className="flex items-center px-4 py-1.5 rounded-md text-yellow-700 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                <RefreshCw className={`h-4 w-4 mr-1.5 ${retryAttempt > 0 ? 'animate-spin' : ''}`} />
                {retryAttempt > 0 ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}