// theme-provider.tsx
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // ① lazy init from localStorage, default to "light"
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = window.localStorage.getItem("theme") as Theme | null;
    return saved ?? "dark";
  });

  // ② whenever theme changes, apply it and persist
  useEffect(() => {
    const root = document.documentElement;
    const actual =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    root.classList.remove("light", "dark");
    root.classList.add(actual);
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}