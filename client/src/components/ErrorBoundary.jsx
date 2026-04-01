import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-8">
          <div className="max-w-md w-full glass-card p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-4">Something went wrong</h1>
            <p className="text-slate-500 mb-6 text-lg">We've encountered an unexpected error.</p>
            {this.state.error && (
              <details className="text-left mb-6 p-3 bg-slate-50 rounded-xl text-sm">
                <summary className="font-medium text-slate-700 cursor-pointer mb-2">Error Details</summary>
                <pre className="text-slate-600 whitespace-pre-wrap">{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="btn-primary px-8 py-3 text-lg font-bold"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
