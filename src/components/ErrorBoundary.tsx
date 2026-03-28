import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 text-center">
          <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Something went wrong
          </p>
          <h1 className="font-serif text-[28px] md:text-[36px] font-light text-foreground mb-6">
            An unexpected error occurred
          </h1>
          <p className="font-sans text-[13px] text-muted-foreground leading-relaxed max-w-md mb-10">
            We apologise for the inconvenience. Please try refreshing the page or returning to the home page.
          </p>
          <div className="flex gap-6">
            <button
              onClick={() => window.location.reload()}
              className="font-sans text-[11px] tracking-[0.15em] uppercase text-foreground underline underline-offset-4 hover:text-foreground/70 transition-colors"
            >
              Refresh
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false })}
              className="font-sans text-[11px] tracking-[0.15em] uppercase text-foreground underline underline-offset-4 hover:text-foreground/70 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
