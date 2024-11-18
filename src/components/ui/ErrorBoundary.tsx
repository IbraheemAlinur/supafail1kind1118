import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private getErrorMessage(error: Error): string {
    if (error.message.includes('network')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    if (error.message.includes('permission')) {
      return 'You do not have permission to access this resource. Please verify your account or contact support.';
    }
    if (error.message.includes('not found')) {
      return 'The requested resource was not found.';
    }
    if (error.message.includes('unauthorized')) {
      return 'Please sign in to access this resource.';
    }
    return error.message;
  }

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  public render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message.toLowerCase().includes('network');

      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            {isNetworkError ? (
              <WifiOff className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            )}
            
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {isNetworkError ? 'Connection Error' : 'Something went wrong'}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {this.getErrorMessage(this.state.error!)}
            </p>

            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </button>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-md overflow-auto">
                  {this.state.error?.stack}
                  {'\n\nComponent Stack:\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}