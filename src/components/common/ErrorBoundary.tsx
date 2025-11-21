/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });

    // Log to error reporting service (e.g., Sentry)
    // reportError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full card">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mb-4">
                  We're sorry, but something unexpected happened. The error has been
                  logged and we'll look into it.
                </p>
              </div>
            </div>

            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
                  Error Details (for developers)
                </summary>
                <div className="p-4 bg-gray-100 rounded-lg overflow-auto">
                  <p className="text-sm font-mono text-red-600 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <button onClick={this.handleReset} className="btn-primary">
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="btn-secondary"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Display Component
 * For displaying specific errors in components
 */
export function ErrorDisplay({
  title = 'Error',
  message,
  error,
  onRetry,
}: {
  title?: string;
  message: string;
  error?: Error;
  onRetry?: () => void;
}) {
  return (
    <div className="card bg-red-50 border border-red-200">
      <div className="flex items-start gap-3">
        <svg
          className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">{title}</h3>
          <p className="text-sm text-red-700 mb-3">{message}</p>

          {error && (
            <details className="mb-3">
              <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-red-800 bg-red-100 p-2 rounded overflow-auto">
                {error.toString()}
              </pre>
            </details>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium text-red-700 hover:text-red-900 underline"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
