import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./AppShell";

import { BooksPage } from "../features/books/page";
import { SessionsPage } from "../features/sessions/page";
import { SettingsPage } from "../features/settings/page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <BooksPage /> },
      { path: "sessions", element: <SessionsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
