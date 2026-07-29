"use client";

import type { ReactNode } from "react";
import { userModel } from "#entities/user";
import { transactionModel } from "#entities/transaction";
import { recipientModel } from "#entities/recipient";
import { cardModel } from "#entities/card";

// Композиция per-request сторов, гидрируемых данными с сервера.
export function StoreProvider({
  user,
  transactions,
  recipients,
  card,
  children,
}: {
  user: userModel.User | null;
  transactions: transactionModel.Transaction[];
  recipients: recipientModel.Recipient[];
  card: cardModel.Card | null;
  children: ReactNode;
}) {
  return (
    <userModel.UserStoreProvider initialUser={user}>
      <transactionModel.TransactionStoreProvider
        initialTransactions={transactions}
      >
        <recipientModel.RecipientStoreProvider initialRecipients={recipients}>
          <cardModel.CardStoreProvider initialCard={card}>
            {children}
          </cardModel.CardStoreProvider>
        </recipientModel.RecipientStoreProvider>
      </transactionModel.TransactionStoreProvider>
    </userModel.UserStoreProvider>
  );
}
