import { FontPreview } from "@/components/FontPreview";
import { FontInfo } from "@/types";

interface FontGridProps {
  fonts: FontInfo[];
  previewText: string;
  fontSize: number;
  isLoading: boolean;
  error: string | null;
}

export function FontGrid({
  fonts,
  previewText,
  fontSize,
  isLoading,
  error,
}: FontGridProps) {
  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-muted-foreground">Loading fonts...</div>
      </div>
    );
  }

  if (fonts.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-muted-foreground">No fonts found</div>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {fonts.map((font) => (
        <FontPreview
          key={font.path}
          font={font}
          previewText={previewText}
          fontSize={fontSize}
        />
      ))}
    </div>
  );
}
