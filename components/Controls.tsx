import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Pin } from "lucide-react";

interface ControlsProps {
  searchText: string;
  setSearchText: (text: string) => void;
  previewText: string;
  setPreviewText: (text: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  hideSystemFonts: boolean;
  setHideSystemFonts: (hide: boolean) => void;
  isAlwaysOnTop: boolean;
  setIsAlwaysOnTop: (isTop: boolean) => void;
}

const mainWindow = new WebviewWindow("main-window");

export function Controls({
  searchText,
  setSearchText,
  previewText,
  setPreviewText,
  fontSize,
  setFontSize,
  hideSystemFonts,
  setHideSystemFonts,
  isAlwaysOnTop,
  setIsAlwaysOnTop,
}: ControlsProps) {
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const clipboardText = await invoke<string>("get_clipboard_text");
        if (clipboardText && clipboardText !== previewText) {
          setPreviewText(clipboardText);
        }
      } catch (error) {
        console.error("Failed to get clipboard text:", error);
      }
    };

    const interval = setInterval(checkClipboard, 1000);
    return () => clearInterval(interval);
  }, [previewText, setPreviewText]);

  const handleAlwaysOnTop = async () => {
    try {
      const newState = !isAlwaysOnTop;
      await mainWindow.setAlwaysOnTop(newState);
      setIsAlwaysOnTop(newState);
    } catch (error) {
      console.error("Failed to set always on top:", error);
    }
  };

  return (
    <Card className="sticky top-0 z-10 rounded-none border-t-0 border-x-0">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search fonts..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
          />
          <Button
            variant={isAlwaysOnTop ? "default" : "outline"}
            size="icon"
            onClick={handleAlwaysOnTop}
            className="w-10 h-10"
          >
            <Pin className={isAlwaysOnTop ? "rotate-45" : ""} />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Enter preview text..."
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="min-w-[100px] text-sm">Size: {fontSize}px</span>
          <Slider
            value={[fontSize]}
            onValueChange={([value]) => setFontSize(value)}
            min={8}
            max={200}
            step={1}
            className="flex-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={hideSystemFonts}
            onCheckedChange={setHideSystemFonts}
            id="system-fonts"
          />
          <label
            htmlFor="system-fonts"
            className="text-sm font-medium cursor-pointer"
          >
            Hide system fonts
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
