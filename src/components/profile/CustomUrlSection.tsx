import React, { useState } from 'react';
import { Globe, Check, X, AlertCircle } from 'lucide-react';

interface CustomUrlSectionProps {
  currentUrl?: string;
  onUpdateUrl: (url: string) => Promise<void>;
  isEditing: boolean;
}

export default function CustomUrlSection({ currentUrl, onUpdateUrl, isEditing }: CustomUrlSectionProps) {
  const [url, setUrl] = useState(currentUrl || '');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCopied, setShowCopied] = useState(false);

  const baseUrl = 'www.1kind.ai';
  const fullUrl = `${baseUrl}/${url}`;

  const validateUrl = (value: string) => {
    if (value.length < 3) return 'URL must be at least 3 characters long';
    if (value.length > 30) return 'URL must be less than 30 characters';
    if (!/^[a-zA-Z0-9-]+$/.test(value)) return 'URL can only contain letters, numbers, and hyphens';
    return null;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setUrl(value);
    setError(null);
  };

  const handleSave = async () => {
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      await onUpdateUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update URL');
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`https://${fullUrl}`);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Profile URL</h3>
        {!isEditing && currentUrl && (
          <button
            onClick={copyToClipboard}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Copy URL
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="custom-url" className="block text-sm font-medium text-gray-700">
              Choose your custom URL
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                {baseUrl}/
              </span>
              <input
                type="text"
                id="custom-url"
                value={url}
                onChange={handleUrlChange}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="your-name"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">
                <AlertCircle className="inline-block h-4 w-4 mr-1" />
                {error}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              This will be your public profile URL. Choose something memorable and professional.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setUrl(currentUrl || '')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 inline-block mr-1" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isChecking || url === currentUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {isChecking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                  Checking...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Save URL
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-gray-400" />
            {currentUrl ? (
              <a
                href={`https://${fullUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
              >
                {fullUrl}
              </a>
            ) : (
              <span className="text-gray-500">No custom URL set</span>
            )}
          </div>
        </div>
      )}

      {showCopied && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg">
          URL copied to clipboard!
        </div>
      )}
    </div>
  );
}