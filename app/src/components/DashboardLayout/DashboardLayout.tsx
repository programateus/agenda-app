import { Outlet } from "react-router";

export const DashboardLayout = () => {
  return (
    <div className="h-dvh overflow-hidden">
      <Outlet />
    </div>
  );
};
