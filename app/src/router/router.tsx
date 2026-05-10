import { type RouteObject } from "react-router";

import { AuthLayout } from "@/components/AuthLayout";
import { DashboardLayout } from "@/components/DashboardLayout";

import { SignUpPage } from "@/pages/SignUp";
import { Dashboard } from "@/pages/Dashboard";
import { SignInPage } from "@/pages/SignIn";

export const router: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      { path: "/sign-up", element: <SignUpPage /> },
      { path: "/sign-in", element: <SignInPage /> },
    ],
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
