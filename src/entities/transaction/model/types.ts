import type {
  TransactionStatus,
  TransactionType,
  TransactionCategory,
} from "#shared/types";

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  merchant: string;
  category: TransactionCategory;
  status: TransactionStatus;
  comment: string | null;
  created_at: string;
};
