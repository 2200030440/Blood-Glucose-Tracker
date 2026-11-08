import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Sweety UI Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-background flex flex-col items-center justify-center p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-border shadow-card text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-health-danger mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-content-primary">
              Something went wrong
            </h2>
            <p className="text-xs text-content-secondary leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred. Please refresh the page.'}
            </p>
            <div className="pt-2">
              <Button
                onClick={() => window.location.reload()}
                icon={RefreshCw}
                className="w-full"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

