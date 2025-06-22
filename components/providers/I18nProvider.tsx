"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { initializeI18n } from "@/lib/i18n";
import { i18n } from "i18next";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);

  useEffect(() => {
    const init = async () => {
      const i18nInstance = await initializeI18n();
      setI18nInstance(i18nInstance);
    };
    init();
  }, []);

  if (!i18nInstance) {
    // Add a loading state if necessary
    return null;
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}
