"use client";

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary for catching render errors in the component tree.
 * Falls back to a minimal message so the user always sees something.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <p>Something went wrong. Please try again later.</p>
          </main>
        )
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
