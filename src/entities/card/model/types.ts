export type Card = {
  id: string;
  user_id: string;
  number: string;
  holder_name: string;
  expires_at: string;
  type: "visa" | "mastercard";
  is_frozen: boolean;
  spending_limit: number;
  spent: number;
};
