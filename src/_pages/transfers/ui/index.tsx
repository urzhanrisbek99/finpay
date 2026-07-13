"use client";

import { useEffect, useState } from "react";
import { TransferModal } from "#features/transfer";
import { QRModal } from "#features/qr-payment";
import { CardTransferModal } from "#features/transfer-by-card";
import { Card, CardContent, CardHeader, CardTitle } from "#shared/ui/card";
import { formatCurrency, formatDate, getInitials } from "#shared/lib";
import { transactionModel } from "#entities/transaction";
import { recipientApi, recipientModel } from "#entities/recipient";
import { userModel } from "#entities/user";
import { Send, ArrowDownLeft } from "lucide-react";

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

const METHOD_TABS: { key: TransferMethod; label: string }[] = [
  { key: "phone", label: "By phone" },
  { key: "qr", label: "By QR" },
  { key: "card", label: "By card" },
];

const METHOD_CTA: Record<TransferMethod, string> = {
  phone: "New transfer",
  qr: "Generate QR",
  card: "Transfer by card",
};

export function Transfers() {
  const [method, setMethod] = useState<TransferMethod>("phone");
  const [transferOpen, setTransferOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [initialPhone, setInitialPhone] = useState<string | undefined>();
  const user = userModel.useUserStore((s) => s.user);
  const transactions = transactionModel
    .useTransactionStore((s) => s.transactions)
    .filter((tx) => tx.type === "transfer");
  const recipients = recipientModel.useRecipientStore((s) => s.recipients);
  const setRecipients = recipientModel.useRecipientStore(
    (s) => s.setRecipients,
  );

  useEffect(() => {
    if (!user) return;
    recipientApi.getAll(user.id).then(({ data }) => {
      if (data) setRecipients(data);
    });
  }, [user, setRecipients]);

  const openTransfer = (phone?: string) => {
    setInitialPhone(phone);
    setTransferOpen(true);
  };

  const startTransfer = () => {
    if (method === "phone") openTransfer();
    else if (method === "qr") setQrOpen(true);
    else setCardOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {METHOD_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMethod(tab.key)}
                  className={`flex-1 rounded-lg py-2 text-xs transition-colors ${
                    method === tab.key
                      ? "bg-violet-100 text-violet-600"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {method === "phone" && recipients.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-3 text-xs">
                  Frequent recipients
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

            <button
              onClick={startTransfer}
              className="w-full rounded-lg bg-violet-600 py-2.5 text-sm text-white transition-colors hover:bg-violet-700"
            >
              {METHOD_CTA[method]}
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Transfer history
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                No transfers yet
              </p>
            ) : (
              <div>
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
                        {tx.merchant}
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
                        {tx.status}
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
