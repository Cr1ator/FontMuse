import {
  exists,
  readTextFile,
  writeTextFile,
  mkdir,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { getCurrentWindow } from "@tauri-apps/api/window"; // Updated import for Tauri 2.0
import { Theme, STORAGE_DIR, STORAGE_FILE } from "./types";

// Get system theme preference
export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Initialize theme storage directory
export async function initThemeStorage(): Promise<void> {
  try {
    const dirExists = await exists(STORAGE_DIR, {
      baseDir: BaseDirectory.AppLocalData,
    });

    if (!dirExists) {
      await mkdir(STORAGE_DIR, {
        baseDir: BaseDirectory.AppLocalData,
      });
    }
  } catch (error) {
    console.error("Failed to create theme storage directory:", error);
  }
}

// Get stored theme preference
export async function getStoredTheme(): Promise<Theme | null> {
  try {
    const fileExists = await exists(STORAGE_FILE, {
      baseDir: BaseDirectory.AppLocalData,
    });

    if (!fileExists) {
      return null;
    }

    const theme = await readTextFile(STORAGE_FILE, {
      baseDir: BaseDirectory.AppLocalData,
    });
    return theme.trim() as Theme;
  } catch (error) {
    console.error("Failed to read theme setting:", error);
    return null;
  }
}

// Save theme preference
export async function saveTheme(theme: Theme): Promise<void> {
  try {
    await initThemeStorage();
    await writeTextFile(STORAGE_FILE, theme, {
      baseDir: BaseDirectory.AppLocalData,
    });
  } catch (error) {
    console.error("Failed to save theme setting:", error);
  }
}

// Sync theme with Tauri window
export async function syncWindowTheme(theme: "light" | "dark"): Promise<void> {
  try {
    const appWindow = getCurrentWindow(); // Updated to Tauri 2.0 API
    // Set window theme - this affects native window controls on Windows
    await appWindow.setTheme(theme);

    // Update window background to match theme
    document.documentElement.style.backgroundColor =
      theme === "dark" ? "rgb(9, 9, 11)" : "rgb(255, 255, 255)";
  } catch (error) {
    console.error("Failed to sync window theme:", error);
  }
}

// Listen for system theme changes
export function listenForSystemThemeChanges(
  callback: (isDark: boolean) => void
): () => void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const listener = (e: MediaQueryListEvent) => callback(e.matches);
  mediaQuery.addEventListener("change", listener);
  return () => mediaQuery.removeEventListener("change", listener);
}
