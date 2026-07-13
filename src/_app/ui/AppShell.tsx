"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { Header } from "#widgets/header";
import { NewPaymentFlow } from "#widgets/new-payment";

const MAX_WIDTH_BY_SEGMENT: Record<string, string> = {
  dashboard: "max-w-6xl",
};
const DEFAULT_MAX_WIDTH = "max-w-4xl";

export function AppShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const maxWidth = MAX_WIDTH_BY_SEGMENT[segment ?? ""] ?? DEFAULT_MAX_WIDTH;

  // профиль и транзакции грузим один раз в оболочке (нужны на нескольких
  // страницах), иначе при прямой перезагрузке страницы данные будут пустыми
  userModel.useUser();
  transactionModel.useTransactions();

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
