import { createBrowserRouter } from "react-router";
import { lazy } from "react";

const PublicLayout = lazy(() => import("../layouts/PublicLayout"));
const HomePage = lazy(() => import("../pages/PublicPages/HomePage"));
const LoginPage = lazy(() => import("../pages/PublicPages/LoginPage"));
const GoToHomePage = lazy(() => import("../pages/GoToHomePage"));
const ResetPage = lazy(() => import("../pages/PublicPages/ResetPage"));

const PublicRouter = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "reset-password/:token",
        Component: ResetPage,
      },
      {
        path: "*",
        Component: GoToHomePage,
      },
    ],
  },
]);

export default PublicRouter;
