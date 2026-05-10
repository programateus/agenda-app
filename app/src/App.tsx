import { BrowserRouter, useRoutes } from "react-router";
import { Toast } from "@heroui/react";

import { AuthProvider } from "./providers/auth/AuthProvider";
import { HeroUIProvider } from "./providers/HeroUIProvider";
import { router } from "./router";

const Routes = () => {
  return useRoutes(router);
};

function App() {
  return (
    <BrowserRouter>
      <HeroUIProvider>
        <AuthProvider>
          <Toast.Provider />
          <Routes />
        </AuthProvider>
      </HeroUIProvider>
    </BrowserRouter>
  );
}

export default App;
