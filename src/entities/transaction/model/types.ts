import type {
  TransactionStatus,
  TransactionType,
  TransactionCategory,
} from "@/src/shared/types";

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  merchant: string;
  category: TransactionCategory;
  status: TransactionStatus;
  created_at: string;
};
