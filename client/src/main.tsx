import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 16, fontFamily: "system-ui" }}>
        <h1>Readr crashed</h1>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {String(this.state.error.stack || this.state.error.message)}
        </pre>
        <button
          onClick={() => {
            try {
              localStorage.clear();
            } catch {
              // ignore
            }
            location.reload();
          }}
        >
          Clear storage & reload
        </button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
);
