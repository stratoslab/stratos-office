import { Component, type ErrorInfo, type ReactNode } from 'react';
import MaterialIcon from './MaterialIcon';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ErrorBoundary:${this.props.name ?? 'unnamed'}]`, error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-red-900/20 border border-red-500/30">
          <MaterialIcon name="error_outline" size={32} style={{ color: 'var(--error)', marginBottom: '12px' }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--on-surface)' }}>
            {this.props.name ? `${this.props.name} encountered an error` : 'Something went wrong'}
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--outline)' }}>
            {this.state.error?.message ?? 'Unknown error'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-lg text-xs font-medium"
            style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
