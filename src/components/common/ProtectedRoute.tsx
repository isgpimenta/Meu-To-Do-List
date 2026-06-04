import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Protects routes by checking authentication.
 * Unauthenticated users are redirected to the login page.
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Simple loading placeholder; can be replaced with a spinner
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}