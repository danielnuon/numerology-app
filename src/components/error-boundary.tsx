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
        <div className="max-w-[480px] w-full mx-auto rounded-sm border border-border bg-manuscript p-8 sm:p-12 shadow-[0_1px_3px_rgba(44,36,23,0.08)] text-center">
          <p className="text-2xl font-light tracking-[0.04em] text-ink mb-4">
            Something went wrong
          </p>
          <p className="text-ink-light text-sm mb-6">
            An unexpected error occurred while calculating your reading.
          </p>
          <button
            onClick={this.handleReset}
            className="text-gold hover:text-gold-light underline underline-offset-4 text-sm tracking-[0.04em] transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
