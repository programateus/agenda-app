import { BrowserRouter, useRoutes } from "react-router";
import { Toast } from "@heroui/react";

import { HeroUIProvider } from "./providers/HeroUIProvider";
import { router } from "./router";

const Routes = () => {
  return useRoutes(router);
};

function App() {
  return (
    <BrowserRouter>
      <HeroUIProvider>
        <Toast.Provider />
        <Routes />
      </HeroUIProvider>
    </BrowserRouter>
  );
}

export default App;
