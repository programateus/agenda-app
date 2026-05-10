import { RouterProvider } from "@heroui/react";
import { useNavigate, useHref } from "react-router";

export const HeroUIProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      {children}
    </RouterProvider>
  );
};
