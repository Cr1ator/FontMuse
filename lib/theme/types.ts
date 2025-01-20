export type Theme = "light" | "dark" | "system";

export const THEME_KEY = "theme-preference";

export const STORAGE_DIR = "settings";
export const STORAGE_FILE = `${STORAGE_DIR}/theme.txt`;

export interface ThemeProviderState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => Promise<void>;
}
