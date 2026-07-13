"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { Header } from "#widgets/header";
import { NewPaymentFlow } from "#widgets/new-payment";

// Ширина контента задаётся по активному маршруту, чтобы глобальный хэдер всегда
// был выровнен с контентом страницы (дашборд шире из-за сетки на 4 колонки).
const MAX_WIDTH_BY_SEGMENT: Record<string, string> = {
  dashboard: "max-w-6xl",
};
const DEFAULT_MAX_WIDTH = "max-w-4xl";

export function AppShell({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const maxWidth = MAX_WIDTH_BY_SEGMENT[segment ?? ""] ?? DEFAULT_MAX_WIDTH;

  // единая глобальная загрузка профиля — хэдер доступен на любой странице,
  // поэтому имя пользователя не должно зависеть от конкретной страницы
  userModel.useUser();
  // и транзакций — история/статистика нужны на нескольких страницах, поэтому
  // грузим один раз в оболочке, а не в каждой странице (иначе при прямой
  // перезагрузке /transfers история пустая)
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
