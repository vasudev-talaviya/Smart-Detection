import { useState, useEffect, useRef } from "react";
import { Palette, Search, Check } from "lucide-react";

const THEMES = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", 
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", 
  "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", 
  "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", 
  "night", "coffee", "winter", "dim", "nord", "sunset"
];

/**
 * Gets the preferred system theme (dark/light)
 * @returns {string} The system theme
 */
function getSystemTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

/**
 * Gets the stored theme from localStorage or falls back to system theme
 * @returns {string} The resolved theme
 */
function getStoredTheme() {
  try {
    const stored = localStorage.getItem("facesync-theme");
    return stored && THEMES.includes(stored) ? stored : getSystemTheme();
  } catch {
    return getSystemTheme();
  }
}

/**
 * Custom hook to manage the application theme
 * @returns {[string, function]} Tuple containing current theme and setter function
 */
export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("facesync-theme", theme);
    } catch {
      // Ignore localStorage errors
    }
  }, [theme]);

  // Listen for system theme changes (if no user preference is saved)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      try {
        if (!localStorage.getItem("facesync-theme")) {
          setThemeState(e.matches ? "dark" : "light");
        }
      } catch {
        // Ignore errors
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return [theme, setThemeState];
}

/**
 * Complete DaisyUI Theme Switcher Component
 * Includes search, theme previews, and keyboard accessibility.
 */
export default function ThemeSwitcher({ theme, setTheme }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  
  const filteredThemes = THEMES.filter(t => t.toLowerCase().includes(search.toLowerCase()));

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard accessibility (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Reset search when opening dropdown
  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-[999]" ref={ref}>
      {/* Floating Action Button */}
      <button
        className={`btn btn-circle btn-lg shadow-2xl bg-base-100 border border-base-content/10 hover-lift hover:bg-base-200 group transition-all duration-300 ${open ? 'ring-2 ring-primary scale-95' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle Theme Switcher"
        aria-expanded={open}
      >
        <Palette className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
      </button>

      {/* Dropdown Content */}
      {open && (
        <div className="absolute bottom-full right-0 mb-4 w-72 max-h-[70vh] bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 flex flex-col slide-up overflow-hidden">
          
          {/* Header & Search */}
          <div className="p-4 border-b border-base-content/10 bg-base-200/50 backdrop-blur-xl">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" /> Theme Switcher
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input 
                type="text" 
                placeholder="Search themes..." 
                className="input input-sm input-bordered w-full pl-9 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                aria-label="Search themes"
              />
            </div>
          </div>
          
          {/* Theme List */}
          <div className="overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {filteredThemes.length === 0 ? (
              <p className="p-4 text-center text-xs opacity-50">No themes found matching "{search}"</p>
            ) : (
              filteredThemes.map(t => (
                <label
                  key={t}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    theme === t 
                      ? "bg-primary/10 text-primary font-bold shadow-sm" 
                      : "hover:bg-base-200 text-base-content opacity-80 hover:opacity-100"
                  }`}
                  onMouseEnter={() => document.documentElement.setAttribute("data-theme", t)}
                  onMouseLeave={() => document.documentElement.setAttribute("data-theme", theme)}
                >
                  <span className="capitalize flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="theme-dropdown" 
                      className="theme-controller radio radio-sm radio-primary hidden" 
                      value={t} 
                      checked={theme === t}
                      onChange={(e) => {
                        if (e.target.checked) setTheme(t);
                      }}
                      aria-label={t}
                    />
                    {theme === t ? <Check className="w-4 h-4" /> : <span className="w-4" />}
                    {t}
                  </span>
                  
                  {/* Theme Color Preview Swatches using nested data-theme */}
                  <div className="flex gap-1 p-1 rounded-md bg-base-200 border border-base-content/5 shadow-inner" data-theme={t}>
                    <div className="w-2.5 h-4 rounded-[2px] bg-primary" title="Primary"></div>
                    <div className="w-2.5 h-4 rounded-[2px] bg-secondary" title="Secondary"></div>
                    <div className="w-2.5 h-4 rounded-[2px] bg-accent" title="Accent"></div>
                    <div className="w-2.5 h-4 rounded-[2px] bg-neutral" title="Neutral"></div>
                  </div>
                </label>
              ))
            )}
          </div>
          
        </div>
      )}
    </div>
  );
}
