"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { WebGLFallback } from "./WebGLFallback";

export interface WebGLErrorBoundaryProps {
  children: ReactNode;
  station?: "MAITRI" | "BHARATI";
  fallback?: ReactNode;
  onReset?: () => void;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): WebGLErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[WebGLErrorBoundary] 3D Engine Failure Intercepted:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <WebGLFallback
          station={this.props.station || "MAITRI"}
          error={this.state.error?.message || "Uncaught 3D graphics rendering exception"}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
