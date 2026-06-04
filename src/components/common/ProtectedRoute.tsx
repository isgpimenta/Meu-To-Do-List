import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

/**
 * Protects routes by checking authentication.
 * Unauthenticated users are redirected to the login page.
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Show a friendly spinner while auth state resolves
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}