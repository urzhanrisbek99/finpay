import type { Messages } from "#shared/i18n";
import type { Transaction } from "./types";

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
