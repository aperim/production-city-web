import { useCallback, useEffect, useState } from "react";
import { Toggle } from "../Toggle/Toggle";
import { cn } from "../../lib/utils";

/** Props for the ThemeToggle atom */
export interface ThemeToggleProps {
  /** Label for light mode */
  lightLabel?: string;
  /** Label for dark mode */
  darkLabel?: string;
  /** Additional class names */
  className?: string;
}

const THEME_STORAGE_KEY = "pc-theme";

function getInitialDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

/**
 * ThemeToggle atom — a switch between light and dark mode.
 * Persists preference to localStorage and applies `.dark` class to `<html>`.
 * Syncs across tabs via the `storage` event.
 */
export function ThemeToggle({
  lightLabel = "Light",
  darkLabel = "Dark",
  className,
}: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(getInitialDark);

  const applyTheme = useCallback((dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleChange = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage may be unavailable
    }
  }, [isDark, applyTheme]);

  // Sync across tabs via storage event
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const dark = e.newValue === "dark";
        setIsDark(dark);
        applyTheme(dark);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applyTheme]);

  return (
    <div className={cn("flex items-center gap-2", className)} data-testid="theme-toggle">
      <span className="text-sm text-muted-foreground">{lightLabel}</span>
      <Toggle
        checked={isDark}
        onChange={handleChange}
        size="sm"
        aria-label={isDark ? darkLabel : lightLabel}
      />
      <span className="text-sm text-muted-foreground">{darkLabel}</span>
    </div>
  );
}
