import { Navigate, Outlet } from "react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

const GuestGuardFallback = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      Loading...
    </div>
  );
};

export const GuestGuard = ({ children }: { children?: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <GuestGuardFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
};
