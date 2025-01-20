import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import {
  readTextFile,
  writeTextFile,
  mkdir,
  exists,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import en from "../locales/en.json";
import ru from "../locales/ru.json";

const SETTINGS_DIR = "settings";
const LANGUAGE_FILE = `${SETTINGS_DIR}/language.txt`;

const resources = {
  en: { translation: en },
  ru: { translation: ru },
};

// Ensure settings directory exists
async function ensureSettingsDirectory() {
  try {
    const dirExists = await exists(SETTINGS_DIR, {
      baseDir: BaseDirectory.AppLocalData,
    });

    if (!dirExists) {
      await mkdir(SETTINGS_DIR, {
        baseDir: BaseDirectory.AppLocalData,
      });
    }
  } catch (error) {
    console.error("Failed to create settings directory:", error);
    throw error;
  }
}

// Get system language
async function getSystemLanguage(): Promise<string> {
  try {
    const lang = await invoke<string>("get_system_language");
    return lang.toLowerCase().startsWith("ru") ? "ru" : "en";
  } catch (error) {
    console.error("Failed to get system language:", error);
    return "en";
  }
}

// Get stored language preference
async function getStoredLanguage(): Promise<string | null> {
  try {
    // Check if language file exists
    const fileExists = await exists(LANGUAGE_FILE, {
      baseDir: BaseDirectory.AppLocalData,
    });

    if (!fileExists) {
      return null;
    }

    // Read the language setting file
    const lang = await readTextFile(LANGUAGE_FILE, {
      baseDir: BaseDirectory.AppLocalData,
    });
    return lang.trim();
  } catch (error) {
    console.error("Failed to read language setting:", error);
    return null;
  }
}

// Save language preference
async function saveLanguage(language: string): Promise<void> {
  try {
    // Ensure settings directory exists before writing
    await ensureSettingsDirectory();

    // Write language setting
    await writeTextFile(LANGUAGE_FILE, language, {
      baseDir: BaseDirectory.AppLocalData,
    });
  } catch (error) {
    console.error("Failed to save language setting:", error);
  }
}

// Initialize i18next
export async function initializeI18n() {
  try {
    const storedLang = await getStoredLanguage();
    const systemLang = await getSystemLanguage();
    const initialLang = storedLang || systemLang;

    await i18next.use(initReactI18next).init({
      resources,
      lng: initialLang,
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });

    return i18next;
  } catch (error) {
    console.error("Failed to initialize i18n:", error);
    // Fallback to basic English initialization
    await i18next.use(initReactI18next).init({
      resources,
      lng: "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
    });
    return i18next;
  }
}

// Language switcher function
export async function changeLanguage(language: "en" | "ru") {
  await i18next.changeLanguage(language);
  await saveLanguage(language);
}

export default i18next;
