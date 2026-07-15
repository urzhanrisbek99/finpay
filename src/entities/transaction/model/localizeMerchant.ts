import type { Messages } from "#shared/i18n";
import type { Transaction } from "./types";

// merchant у переводов генерируется на английском при создании (см. API фич
// transfer / transfer-by-card) и хранится в БД. Здесь он локализуется при
// отображении по структурным полям — работает и для уже сохранённых записей.
// Пользовательские merchant (QR-платёж, источник дохода) остаются как есть.
export function localizeMerchant(tx: Transaction, t: Messages): string {
  if (tx.type === "transfer") {
    if (tx.method === "card") {
      const last4 = tx.merchant.replace(/\D/g, "").slice(-4);
      return t.transactions.transferToCard(last4);
    }
    if (tx.method === "phone") {
      const phone = tx.merchant.replace(/^Transfer to\s*/i, "").trim();
      return t.transactions.transferToPhone(phone);
    }
  }
  return tx.merchant;
}
