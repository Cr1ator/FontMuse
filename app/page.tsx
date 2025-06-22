"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
// import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
// import { FontPreview } from "@/components/FontPreview";
import { Controls } from "@/components/Controls";
import { useDebounce } from "@/hooks/useDebounce";
import type { FontInfo } from "@/types";
import { FontGrid } from "@/components/FontGrid";

// const mainWindow = new WebviewWindow("main-window");

export default function HomePage() {
  const [fonts, setFonts] = useState<FontInfo[]>([]);
  const [searchText, setSearchText] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [hideSystemFonts, setHideSystemFonts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

  const debouncedSearch = useDebounce(searchText, 300);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      setIsLoading(true);
      const fontList = await invoke<FontInfo[]>("get_system_fonts");
      setFonts(fontList.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fonts");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFonts = fonts.filter((font) => {
    if (hideSystemFonts && font.is_system) return false;
    if (debouncedSearch) {
      return font.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-background">
      <Controls
        searchText={searchText}
        setSearchText={setSearchText}
        previewText={previewText}
        setPreviewText={setPreviewText}
        fontSize={fontSize}
        setFontSize={setFontSize}
        hideSystemFonts={hideSystemFonts}
        setHideSystemFonts={setHideSystemFonts}
        isAlwaysOnTop={isAlwaysOnTop}
        setIsAlwaysOnTop={setIsAlwaysOnTop}
      />
      <FontGrid
        fonts={filteredFonts}
        previewText={previewText}
        fontSize={fontSize}
        isLoading={isLoading}
        error={error}
      />
    </main>
  );
}
