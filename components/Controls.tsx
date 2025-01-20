import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Pin, Clipboard } from "lucide-react";

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
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const checkSelection = async () => {
      try {
        const selectedText = await invoke<string>("get_selected_text");
        if (
          selectedText &&
          selectedText.trim() !== "" &&
          selectedText !== previewText
        ) {
          setPreviewText(selectedText.trim());
        }
      } catch (error) {
        console.error("Failed to get selected text:", error);
      }
    };

    if (isMonitoringEnabled) {
      interval = setInterval(checkSelection, 500);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMonitoringEnabled, previewText, setPreviewText]);

  const handleAlwaysOnTop = async () => {
    try {
      console.log("handleAlwaysOnTop called, current state:", isAlwaysOnTop);

      const window = await getCurrentWindow();
      console.log("Got window instance:", window);

      const newState = !isAlwaysOnTop;
      console.log("Setting new state to:", newState);

      await window.setAlwaysOnTop(newState);
      console.log("Always on top set successfully");

      setIsAlwaysOnTop(newState);
      console.log("State updated");
    } catch (error) {
      console.error("Detailed error in setAlwaysOnTop:", error);
      // Попробуем получить больше информации об ошибке
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
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
            title={
              isAlwaysOnTop ? "Disable always on top" : "Enable always on top"
            }
          >
            <Pin className={isAlwaysOnTop ? "rotate-45" : ""} />
          </Button>
        </div>

        {/* Rest of the component remains the same */}
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Enter preview text... (or select text anywhere)"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Switch
              checked={isMonitoringEnabled}
              onCheckedChange={setIsMonitoringEnabled}
              id="text-monitoring"
            />
            <label
              htmlFor="text-monitoring"
              className="text-sm font-medium cursor-pointer"
            >
              <Clipboard
                className={`h-4 w-4 ${
                  isMonitoringEnabled ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </label>
          </div>
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
