import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ThemeService } from '../services/themeService';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const themeService = ThemeService.getInstance();
      try {
        const errorTemplate = themeService.getTemplate('error');
        return <div dangerouslySetInnerHTML={{ __html: errorTemplate }} />;
      } catch (e) {
        return (
          <div className="error-page">
            <h1>Something went wrong</h1>
            <p>{this.state.error?.message}</p>
            <button onClick={() => this.setState({ hasError: false })}>
              Try again
            </button>
          </div>
        );
      }
    }

    return this.props.children;
  }
}
