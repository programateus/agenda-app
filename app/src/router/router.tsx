import { type RouteObject } from "react-router";

import { AuthLayout } from "@/components/AuthLayout";
import { DashboardLayout } from "@/components/DashboardLayout";

import { SignUpPage } from "@/pages/SignUp";
import { Dashboard } from "@/pages/Dashboard";

export const router: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [{ path: "/sign-up", element: <SignUpPage /> }],
  },
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
];
