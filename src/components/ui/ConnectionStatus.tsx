import React from 'react';
import { WifiOff, RefreshCw, Wifi } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError('You are currently offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetryConnection = async () => {
    if (isReconnecting) return;

    setIsReconnecting(true);
    try {
      // Test connection by making a simple query
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (error) throw error;
      
      setIsOnline(true);
      setError(null);
    } catch (err) {
      setError('Failed to reconnect. Please check your internet connection.');
    } finally {
      setIsReconnecting(false);
    }
  };

  if (isOnline && !error) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-100">
      <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex-1 flex items-center">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-yellow-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-yellow-600" />
            )}
            <p className="ml-3 font-medium text-yellow-700 truncate">
              {error || 'Connection issues detected. Some features may be limited.'}
            </p>
          </div>
          <div className="flex-shrink-0 order-2 sm:order-3 sm:ml-3">
            <button
              onClick={handleRetryConnection}
              disabled={isReconnecting}
              className="flex items-center px-4 py-1.5 rounded-md text-yellow-700 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isReconnecting ? 'animate-spin' : ''}`} />
              {isReconnecting ? 'Retrying...' : 'Retry Connection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}