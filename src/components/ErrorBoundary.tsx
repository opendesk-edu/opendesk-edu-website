"use client";

import React, { Component, ReactNode } from "react";
import { useTranslations } from "next-intl";

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const t = useTranslations("errorBoundary");

  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] p-4">
      <div className="max-w-md w-full rounded-lg border border-border bg-background-secondary p-6 shadow-lg">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t("title")}
        </h2>
        <p className="text-sm text-foreground-secondary mb-6">
          {t("message")}
        </p>
        <button
          onClick={onReset}
          className="w-full px-4 py-2 text-sm rounded-lg bg-accent text-white hover:opacity-90 transition-opacity cursor-pointer"
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
