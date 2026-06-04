"use client";

import { useAuth } from "@/context/AuthProvider";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) return null; // could show a spinner

  return session ? <>{children}</> : <Navigate to="/login" replace />;
};