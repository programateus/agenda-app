import { Navigate, Outlet } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

const AuthGuardFallback = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>
  );
};

export const AuthGuard = ({ children }: { children?: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthGuardFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return children ?? <Outlet />;
};
