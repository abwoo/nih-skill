"use client"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[GlobalErrorBoundary] Caught error:", error, errorInfo)
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to Sentry, LogRocket, etc.
      console.error("[GlobalErrorBoundary] Would report to monitoring service")
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center animate-fade-in">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-danger/10 flex items-center justify-center glow-primary">
              <svg 
                className="w-10 h-10 text-danger" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {this.state.error?.message || "An unexpected error occurred while rendering this component."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors border border-primary/20"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
              >
                Reload Page
              </button>
            </div>

            {/* Technical Details */}
            {process.env.NODE_ENV === "development" && this.state.error?.stack && (
              <details className="text-left mt-6">
                <summary className="cursor-pointer text-xs font-mono text-muted-foreground hover:text-foreground">
                  Technical Details
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-card border border-border overflow-auto max-h-48 text-xs font-mono text-muted-foreground">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Support Link */}
            <p className="text-xs text-muted-foreground pt-4">
              If the problem persists,{" "}
              <a 
                href="mailto:support@bme-research.com" 
                className="text-primary hover:text-primary/80 underline"
              >
                contact support
              </a>{" "}
              or check our{" "}
              <a 
                href="/api/gateway?route=health" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 underline"
              >
                system status
              </a>.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary
