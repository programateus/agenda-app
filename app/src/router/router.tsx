import { type RouteObject } from "react-router";

import { AuthLayout } from "@/components/AuthLayout";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuthGuard } from "@/guards/AuthGuard";
import { GuestGuard } from "@/guards/GuestGuard";

import { SignUpPage } from "@/pages/SignUp";
import { SignInPage } from "@/pages/SignIn";
import { DashboardPage } from "@/pages/Dashboard";

export const router: RouteObject[] = [
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/sign-up", element: <SignUpPage /> },
          { path: "/sign-in", element: <SignInPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
];
