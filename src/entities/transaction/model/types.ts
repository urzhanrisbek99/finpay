import type {
  TransactionStatus,
  TransactionType,
  TransactionCategory,
  TransactionMethod,
} from "#shared/model";

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  merchant: string;
  category: TransactionCategory;
  status: TransactionStatus;
  comment: string | null;
  method: TransactionMethod | null;
  created_at: string;
};
