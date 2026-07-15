"use client";

import { useState } from "react";
import { TransferModal } from "#features/transfer";
import { QRModal } from "#features/qr-payment";
import { CardTransferModal } from "#features/transfer-by-card";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";
import { formatCurrency, getInitials } from "#shared/lib";
import { useT, useFormatDate } from "#shared/i18n";
import { transactionModel } from "#entities/transaction";
import { recipientModel } from "#entities/recipient";
import {
  Send,
  ArrowDownLeft,
  Smartphone,
  QrCode,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-600",
  "bg-green-100 text-green-600",
  "bg-blue-100 text-blue-600",
  "bg-pink-100 text-pink-600",
  "bg-amber-100 text-amber-700",
];

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

type TransferMethod = "phone" | "qr" | "card";

const METHOD_KEYS: TransferMethod[] = ["phone", "qr", "card"];

// Иконка и цвет метода — язык-нейтральны; подпись берётся из словаря по ключу.
const METHOD_META: Record<TransferMethod, { icon: LucideIcon; color: string }> =
  {
    phone: { icon: Smartphone, color: "bg-violet-100 text-violet-600" },
    qr: { icon: QrCode, color: "bg-blue-100 text-blue-600" },
    card: { icon: CreditCard, color: "bg-green-100 text-green-600" },
  };

export function Transfers() {
  const [method, setMethod] = useState<TransferMethod>("phone");
  const [transferOpen, setTransferOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [initialPhone, setInitialPhone] = useState<string | undefined>();
  const allTransactions = transactionModel.useTransactionStore(
    (s) => s.transactions,
  );
  const transactions = allTransactions.filter((tx) => tx.type === "transfer");
  // Данные (транзакции, получатели) гидрируются из SSR — грузить нечего.
  const recipients = recipientModel.useRecipientStore((s) => s.recipients);
  const t = useT();
  const formatDate = useFormatDate();

  const openTransfer = (phone?: string) => {
    setInitialPhone(phone);
    setTransferOpen(true);
  };

  const startTransfer = () => {
    if (method === "phone") openTransfer();
    else if (method === "qr") setQrOpen(true);
    else setCardOpen(true);
  };

  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );
  const monthTransfers = transactions.filter(
    (tx) => tx.status !== "failed" && new Date(tx.created_at) >= monthStart,
  );
  const sentThisMonth = monthTransfers.reduce((sum, tx) => sum + tx.amount, 0);

  const methodStats = METHOD_KEYS.map((key) => {
    const txs = allTransactions.filter(
      (tx) =>
        tx.method === key &&
        tx.status !== "failed" &&
        new Date(tx.created_at) >= monthStart,
    );
    return {
      key,
      total: txs.reduce((sum, tx) => sum + tx.amount, 0),
      count: txs.length,
    };
  });

  const summary = [
    { label: t.transfers.sentThisMonth, value: formatCurrency(sentThisMonth) },
    { label: t.transfers.transfersCount, value: String(monthTransfers.length) },
  ];

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-4">
        {summary.map((item) => (
          <div key={item.label} className="bg-background rounded-xl border p-4">
            <p className="text-muted-foreground mb-1 text-xs">{item.label}</p>
            <p className="text-lg font-medium">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t.transfers.newTransfer}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {METHOD_KEYS.map((key) => (
                <button
                  key={key}
                  onClick={() => setMethod(key)}
                  className={`flex-1 rounded-lg py-2 text-xs transition-colors ${
                    method === key
                      ? "bg-violet-100 text-violet-600"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.transfers.methods[key]}
                </button>
              ))}
            </div>

            {method === "phone" && recipients.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-3 text-xs">
                  {t.transfers.frequentRecipients}
                </p>
                <div className="flex flex-wrap gap-3">
                  {recipients.slice(0, 5).map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => openTransfer(r.phone)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-transform hover:scale-105 ${
                          AVATAR_COLORS[i % AVATAR_COLORS.length]
                        }`}
                      >
                        {getInitials(r.name)}
                      </div>
                      <span className="text-muted-foreground max-w-14 truncate text-xs">
                        {r.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-muted-foreground mb-3 text-xs">
                {t.transfers.thisMonthsTransfers}
              </p>
              <div className="space-y-2">
                {methodStats.map(({ key, total, count }) => {
                  const meta = METHOD_META[key];
                  const Icon = meta.icon;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${meta.color}`}
                      >
                        <Icon size={15} />
                      </div>
                      <span className="flex-1 text-sm">
                        {t.transfers.methods[key]}
                      </span>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(total)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {count} {t.transfers.transferWord(count)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={startTransfer}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm text-white transition-colors hover:bg-violet-700"
            >
              {t.transfers.cta[method]}
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t.transfers.history}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                {t.transfers.noTransfers}
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 border-b py-2.5 last:border-0"
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        tx.type === "income"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowDownLeft size={15} />
                      ) : (
                        <Send size={15} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {transactionModel.localizeMerchant(tx, t)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {tx.type === "income" ? "+" : "−"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          STATUS_COLORS[tx.status] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t.transactions.status[
                          tx.status as keyof typeof t.transactions.status
                        ] ?? tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TransferModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        initialPhone={initialPhone}
      />
      <QRModal open={qrOpen} onClose={() => setQrOpen(false)} />
      <CardTransferModal open={cardOpen} onClose={() => setCardOpen(false)} />
    </>
  );
}
