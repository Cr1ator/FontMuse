import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-destructive">{t("fontGrid.error")}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-muted-foreground">{t("fontGrid.loading")}</div>
      </div>
    );
  }

  if (fonts.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="text-muted-foreground">{t("fontGrid.noFonts")}</div>
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
