"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-[480px] w-full mx-auto glass rounded-2xl p-8 sm:p-12 text-center">
          <p className="font-display text-2xl tracking-[0.04em] text-ink mb-4">
            Something went wrong
          </p>
          <p className="text-ink-light text-sm mb-6">
            An unexpected error occurred while calculating your reading.
          </p>
          <button
            onClick={this.handleReset}
            type="button"
            className="pressable inline-flex items-center min-h-[44px] px-2 rounded-sm text-gold-deep hover:text-ink active:opacity-70 underline underline-offset-4 text-sm tracking-[0.04em]"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
