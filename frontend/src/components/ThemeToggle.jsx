import { useEffect, useState } from "react";
import "./ThemeToggle.css";

const THEME_KEY = "site_theme";
const LIGHT = "theme-light";
const DARK = "theme-dark";

function applyTheme(name) {
  console.log("[ThemeToggle] Applying theme:", name);
  document.documentElement.classList.remove(LIGHT, DARK);
  document.documentElement.classList.add(name);
  console.log("[ThemeToggle] HTML classes:", document.documentElement.className);
  document.documentElement.setAttribute("data-theme", name);
  try {
    localStorage.setItem(THEME_KEY, name);
    console.log("[ThemeToggle] Saved to localStorage:", name);
  } catch (e) {
    console.error("[ThemeToggle] localStorage error:", e);
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(LIGHT); // Default to light

  useEffect(() => {
    // Initialize theme on mount
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
      console.log("[ThemeToggle] Loaded from localStorage:", saved);
    } catch {}

    const initial = saved || (
      typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? DARK
        : LIGHT
    );

    console.log("[ThemeToggle] Initial theme:", initial);
    setTheme(initial);
    applyTheme(initial);
  }, []);

  // Update DOM whenever theme changes
  useEffect(() => {
    if (theme) {
      applyTheme(theme);
    }
  }, [theme]);

  const toggle = () => {
    console.log("[ThemeToggle] Toggle clicked, current theme:", theme);
    setTheme(prev => {
      const next = prev === DARK ? LIGHT : DARK;
      console.log("[ThemeToggle] New theme will be:", next);
      return next;
    });
  };

  return (
      <div className="theme-toggle-container">
        <div className="sun-icon hidden lg:block">
          <svg aria-hidden="true" width="1.5em" height="1.5em" viewBox="0 0 29 29" fill="none"
               xmlns="http://www.w3.org/2000/svg" className="lg:h-6 lg:w-6">
            <path
                d="M14.883 27.334h-2.598v-4h2.598v4zm6.968-2.963l-2.755-2.828 1.836-1.885 2.757 2.829-1.836 1.884h-.002zm-16.533 0L3.48 22.486l2.754-2.83 1.838 1.886-2.754 2.828v.001zm8.266-3.695c-3.591-.001-6.502-2.99-6.5-6.677 0-3.687 2.912-6.675 6.504-6.675 3.591 0 6.502 2.99 6.502 6.676-.003 3.687-2.914 6.674-6.506 6.676zm0-10.685c-2.156.001-3.904 1.797-3.903 4.011.001 2.214 1.75 4.008 3.907 4.008s3.905-1.796 3.905-4.01c-.002-2.214-1.751-4.008-3.909-4.009zm12.99 5.343h-3.897v-2.667h3.896v2.667zm-22.082 0H.595v-2.667h3.897v2.667zm16.439-6.99l-1.835-1.886 2.755-2.83 1.838 1.887-2.757 2.828-.001.001zm-14.695 0L3.483 5.516 5.32 3.631l2.753 2.83-1.836 1.882-.002.001zm8.647-3.677h-2.598v-4h2.598v4z"
                fill="currentColor"></path>
          </svg>
        </div>
        <label className="theme-toggle-switch" title="Toggle color theme">
          <input
              type="checkbox"
              checked={theme === DARK}
              onChange={toggle}
              aria-label="Toggle color theme"
              className="theme-toggle-checkbox"
          />
          <span className="theme-toggle-slider"></span>
        </label>
        <div className="moon-icon hidden lg:block">
          <svg aria-hidden="true" width="1.5em" height="1.5em" viewBox="0 0 25 26" fill="none"
               xmlns="http://www.w3.org/2000/svg" className="lg:h-6 lg:w-6">
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M20.13 19.097l-.3.003c-7.364 0-13.333-6.112-13.333-13.653 0-.103.001-.206.003-.308a10.005 10.005 0 00-3.64 7.755c0 5.484 4.342 9.93 9.697 9.93 3.063 0 5.796-1.455 7.574-3.727zm1.477-2.627c-.578.098-1.172.148-1.777.148-6.025 0-10.909-5.001-10.909-11.171 0-.62.05-1.228.144-1.82.16-1 .45-1.957.852-2.85a11.857 11.857 0 00-2.96 1.107C3.08 3.955.436 8.108.436 12.894c0 6.855 5.426 12.413 12.12 12.413 4.674 0 8.73-2.709 10.752-6.677.482-.945.849-1.963 1.08-3.032-.87.411-1.805.708-2.782.873z"
                  fill="currentColor"></path>
          </svg>
        </div>
      </div>
  );
}

