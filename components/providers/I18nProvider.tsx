"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { initializeI18n } from "@/lib/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [i18n, setI18n] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const i18nInstance = await initializeI18n();
      setI18n(i18nInstance);
    };
    init();
  }, []);

  if (!i18n) {
    // Можно добавить здесь loading state если нужно
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
