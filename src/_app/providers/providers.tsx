"use client";

import { ThemeProvider } from "next-themes";
import { I18nProvider, type Locale } from "#shared/i18n";

export function Providers({
  locale,
  timeZone,
  children,
}: {
  locale: Locale;
  timeZone: string;
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider initialLocale={locale} initialTimeZone={timeZone}>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
