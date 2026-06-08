/**
 * App — Root layout with routing, health check, theme, and toaster.
 * Uses centralized route config and barrel imports.
 */
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar, ThemeSwitcher, HealthStatus } from "./components/common";
import { useTheme } from "./components/common/ThemeSwitcher";
import { Scanner, UsersList } from "./pages";
import { checkHealth } from "./services/api";
import { routes, DEFAULT_ROUTE } from "./config/routes";
import { Toaster } from "react-hot-toast";

/** Map route IDs to page components */
const PAGE_COMPONENTS = {
  scanner: Scanner,
  users: UsersList,
};

export default function App() {
  const [health, setHealth] = useState(null);
  const [theme, setTheme] = useTheme();

  useEffect(() => {
    const check = () => {
      checkHealth()
        .then((res) =>
          setHealth({
            api: true,
            db: res.database === "connected",
            dbStatus: res.database || "unknown",
          })
        )
        .catch(() =>
          setHealth({ api: false, db: false, dbStatus: "unreachable" })
        );
    };
    check();
    // Re-check every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pb-12 relative">
        {/* Health indicator */}
        <HealthStatus health={health} />

        <Routes>
          <Route path="/" element={<Navigate to={DEFAULT_ROUTE} replace />} />
          {routes.map((route) => {
            const Component = PAGE_COMPONENTS[route.id];
            return (
              <Route
                key={route.id}
                path={route.path}
                element={<Component />}
              />
            );
          })}
        </Routes>
      </main>

      {/* Floating Theme Switcher */}
      <ThemeSwitcher theme={theme} setTheme={setTheme} />

      {/* Global Toaster for notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Footer */}
      <footer className="text-center py-6 text-xs opacity-40">
        FaceSync v1.0 — AI-Powered Attendance System
      </footer>
    </div>
  );
}
