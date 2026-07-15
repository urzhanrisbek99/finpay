"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider, type Locale } from "#shared/i18n";

export function Providers({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider initialLocale={locale}>{children}</I18nProvider>
    </ThemeProvider>
  );
}
