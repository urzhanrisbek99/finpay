"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { Header } from "#widgets/header";
import { NewPaymentFlow } from "#widgets/new-payment";

const MAX_WIDTH_BY_SEGMENT: Record<string, string> = {
  dashboard: "max-w-6xl",
};
const DEFAULT_MAX_WIDTH = "max-w-4xl";

export function AppShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const maxWidth = MAX_WIDTH_BY_SEGMENT[segment ?? ""] ?? DEFAULT_MAX_WIDTH;

  // Профиль, транзакции и получатели уже загружены на сервере в layout и
  // прокинуты в сторы через StoreProvider — здесь ничего грузить не нужно.
  return (
    <>
      <div className={`mx-auto ${maxWidth}`}>
        <Header />
        {children}
      </div>

      <NewPaymentFlow />
    </>
  );
}
