import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "#app";
import { getServerLocale, getServerTimeZone } from "#shared/i18n/server";
import "#app/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinPay",
  description: "Personal banking dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, timeZone] = await Promise.all([
    getServerLocale(),
    getServerTimeZone(),
  ]);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Providers locale={locale} timeZone={timeZone}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
