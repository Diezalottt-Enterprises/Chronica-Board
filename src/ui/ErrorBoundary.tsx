// Error boundary component for Chronica v0.1.0-alpha
// Catches React errors and displays fallback UI

import { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "../services/logger";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component
 * Catches unhandled errors in React component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("Error boundary caught error:", error);
    logger.error("Error info:", errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    // Reload app
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: "32px",
          textAlign: "center",
          background: "#f5f5f5",
        }}>
          <div style={{
            fontSize: "64px",
            marginBottom: "16px",
          }}>
            ⚠️
          </div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: 600,
            marginBottom: "8px",
            color: "#2b2d42",
          }}>
            Something went wrong
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#6c757d",
            marginBottom: "24px",
            maxWidth: "400px",
          }}>
            Chronica encountered an unexpected error. Your data is safe.
          </p>
          {this.state.error && (
            <details style={{
              marginBottom: "24px",
              padding: "16px",
              background: "white",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "100%",
              textAlign: "left",
            }}>
              <summary style={{
                cursor: "pointer",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#2b2d42",
              }}>
                Error details
              </summary>
              <code style={{
                display: "block",
                padding: "8px",
                background: "#f5f5f5",
                borderRadius: "4px",
                fontSize: "12px",
                overflow: "auto",
                color: "#d32f2f",
              }}>
                {this.state.error.toString()}
              </code>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: "12px 24px",
              background: "#6fc2db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
