// статусы транзакции
export type TransactionStatus = "completed" | "pending" | "failed";

// типы транзакции
export type TransactionType = "income" | "expense" | "transfer";

// категории
export type TransactionCategory =
  | "food"
  | "transport"
  | "shopping"
  | "subscription"
  | "transfer"
  | "salary"
  | "other";

// общий тип ответа от API
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};
