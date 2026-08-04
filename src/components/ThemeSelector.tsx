"use client";

import { THEMES, type ThemeName } from "@/lib/types";
import { Palette } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "concert-cost-theme";

export function ThemeSelector({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeName>("cupcake");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    const initial =
      saved && THEMES.includes(saved) ? saved : ("cupcake" as ThemeName);
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function onChange(next: ThemeName) {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <Palette className="h-4 w-4 opacity-70" aria-hidden />
      <span className="sr-only">Theme</span>
      <select
        className="select select-bordered select-sm w-full max-w-[11rem]"
        value={theme}
        onChange={(e) => onChange(e.target.value as ThemeName)}
        aria-label="Choose theme"
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
