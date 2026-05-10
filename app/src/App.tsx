import { BrowserRouter, useRoutes } from "react-router";
import { Toast } from "@heroui/react";
import { router } from "./router";

const Routes = () => {
  return useRoutes(router);
};

function App() {
  return (
    <BrowserRouter>
      <Toast.Provider />
      <Routes />
    </BrowserRouter>
  );
}

export default App;
