import React from "react";

type S = { hasError: boolean; info?: string };

function isChunkLoadError(info?: string): boolean {
  if (!info) return false;
  return (
    info.includes("Loading chunk") ||
    info.includes("Failed to fetch dynamically imported module") ||
    info.includes("error loading dynamically imported module") ||
    info.includes("Importing a module script failed") ||
    info.includes("ChunkLoadError")
  );
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, S> {
  state: S = { hasError: false };

  static getDerivedStateFromError(err: any) {
    return { hasError: true, info: String(err) };
  }

  componentDidCatch(err: any, info: any) {
    console.error("App error:", err, info);
    const msg = String(err?.message || err || "");
    if (!isChunkLoadError(msg) && !isChunkLoadError(this.state.info)) return;

    // After a deploy, lazy routes 404 old hashed chunks. Hard-reload once with cache bust.
    const key = "arcos-chunk-reload";
    try {
      const last = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - last > 12_000) {
        sessionStorage.setItem(key, String(Date.now()));
        const url = new URL(window.location.href);
        url.searchParams.set("_v", String(Date.now()));
        window.location.replace(url.toString());
      }
    } catch {
      /* ignore */
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, info: undefined });
  };

  render() {
    if (this.state.hasError) {
      const chunk = isChunkLoadError(this.state.info);

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#232323] text-white px-6">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider mb-3">
              {chunk ? "Update Available" : "Something Went Wrong"}
            </h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              {chunk
                ? "The app was updated on the server while this tab was open. Reload to load the new version."
                : "An unexpected error occurred. You can try again or reload the page."}
            </p>
            <div className="flex items-center justify-center gap-4">
              {!chunk ? (
                <button
                  onClick={this.handleRetry}
                  className="px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all"
                >
                  Try Again
                </button>
              ) : null}
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all"
              >
                Reload Page
              </button>
            </div>
            {this.state.info && !chunk && (
              <details className="mt-8 text-left">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 uppercase tracking-wider">
                  Error Details
                </summary>
                <pre className="mt-3 p-4 bg-[#353535] rounded-lg border border-white/10 text-xs text-gray-400 overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.info}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
