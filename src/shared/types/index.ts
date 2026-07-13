export type TransactionStatus = "completed" | "pending" | "failed";

export type TransactionType = "income" | "expense" | "transfer";

export type TransactionCategory =
  | "food"
  | "transport"
  | "shopping"
  | "subscription"
  | "transfer"
  | "salary"
  | "other";

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};
