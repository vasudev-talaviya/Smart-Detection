/**
 * Navbar — Main navigation with desktop tabs and mobile dropdown.
 * Uses centralized route config from config/routes.js.
 */
import { ScanFace, Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { routes } from "../../config/routes";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar liquid-navbar sticky top-0 z-50 px-4 lg:px-8 mb-6 rounded-b-2xl">
      {/* Brand */}
      <div className="flex-1 gap-2">
        <div className="relative">
          <ScanFace className="w-7 h-7 text-primary" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success animate-ping" />
        </div>
        <span className="text-lg font-bold tracking-tight hidden sm:inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          FaceSync
        </span>
      </div>

      {/* Desktop Tabs */}
      <div className="flex-none hidden md:block">
        <div role="tablist" className="tabs tabs-box tabs-sm bg-base-200/60">
          {routes.map((t) => (
            <NavLink
              key={t.id}
              to={t.path}
              className={({ isActive }) =>
                `tab px-6 h-10 liquid-tab ${isActive ? "active" : ""}`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="flex-none md:hidden mr-2">
        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle btn-sm"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {mobileOpen && (
            <ul
              tabIndex={0}
              className="dropdown-content z-[999] menu p-2 shadow-2xl bg-base-200 rounded-2xl w-52 border border-base-content/10 mt-2 fade-in"
            >
              {routes.map((t) => (
                <li key={t.id}>
                  <NavLink
                    to={t.path}
                    className={({ isActive }) =>
                      `font-medium liquid-tab px-4 py-2 ${isActive ? "active" : ""}`
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
