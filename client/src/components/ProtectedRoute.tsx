import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, requires the user to have the "admin" role */
  requireAdmin?: boolean;
}

/**
 * Wraps a page component to ensure only authenticated users can access it.
 * Optionally requires admin role. Redirects to /login if not authenticated
 * or to / if authenticated but not admin.
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setLocation("/login");
      return;
    }

    if (requireAdmin && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, loading, requireAdmin, setLocation]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && user.role !== "admin") return null;

  return <>{children}</>;
}
