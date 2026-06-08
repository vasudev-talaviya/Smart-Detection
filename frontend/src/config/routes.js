/**
 * Centralized route configuration — single source of truth
 * Used by App.jsx for routing and Navbar for navigation tabs.
 */
export const routes = [
  { id: "scanner", path: "/scanner", label: "Scanner" },
  { id: "users", path: "/users", label: "Users" },
];

/** Default redirect path */
export const DEFAULT_ROUTE = "/scanner";

