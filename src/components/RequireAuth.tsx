import React from "react";
import { useLocation } from "react-router-dom";
import { hasAuthToken, verifyAuth, subscribeAuth } from "../store";

interface RequireAuthProps {
  children: React.ReactElement;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const tokenPresent = hasAuthToken();
  const [status, setStatus] = React.useState<"checking" | "authorized" | "unauthorized">(
    () => (tokenPresent ? "checking" : "unauthorized")
  );

  React.useEffect(() => {
    const unsubscribe = subscribeAuth((authorized) => {
      setStatus(authorized ? "authorized" : "unauthorized");
    });

    let cancelled = false;

    if (!tokenPresent) {
      setStatus("unauthorized");
      return () => {
        cancelled = true;
        unsubscribe();
      };
    }

    setStatus("checking");

    verifyAuth()
      .then((ok) => {
        if (cancelled) return;
        setStatus(ok ? "authorized" : "unauthorized");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("unauthorized");
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [tokenPresent]);

  React.useEffect(() => {
    if (status === "unauthorized") {
      const from = location.pathname.startsWith("/app") ? "/login" : `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
      window.location.replace(from);
    }
  }, [status, location.pathname, location.search]);

  // Only render children when authorized to prevent hook order issues
  // This ensures AppStateProvider and its hooks are only called when authorized
  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Verifying session…
      </div>
    );
  }

  if (status === "unauthorized") {
    return null;
  }

  // Only render when status is "authorized"
  if (status !== "authorized") {
    return null;
  }

  return children;
}
