import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontInfo } from "@/types";

interface FontPreviewProps {
  font: FontInfo;
  previewText: string;
  fontSize: number;
}

export function FontPreview({ font, previewText, fontSize }: FontPreviewProps) {
  const { t } = useTranslation();
  const defaultText = "The quick brown fox jumps over the lazy dog";

  return (
    <Card className="overflow-hidden hover:border-primary transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-medium">{font.name}</h3>
        {font.is_system && (
          <Badge variant="secondary">{t("fontGrid.systemBadge")}</Badge>
        )}
      </CardHeader>
      <CardContent>
        <p
          className="break-words leading-relaxed"
          style={{
            fontFamily: font.name,
            fontSize: `${fontSize}px`,
          }}
        >
          {previewText || defaultText}
        </p>
      </CardContent>
    </Card>
  );
}
