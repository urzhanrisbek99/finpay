// форматирование суммы → ₸1,240,500
export function formatCurrency(amount: number): string {
  return (
    new Intl.NumberFormat("ru-KZ", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount) + " ₸"
  );
}

// форматирование даты → Today, 09:00
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isToday) return `Today, ${time}`;
  if (isYesterday) return `Yesterday, ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// форматирование номера карты → •••• •••• •••• 4821
export function formatCardNumber(number: string): string {
  const last4 = number.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

// KZ-номер: после +7 ровно 10 цифр
export function isValidPhone(digits: string): boolean {
  return /^7\d{9}$/.test(digits);
}

// форматирование ввода телефона → (702) 123-45-67
export function formatPhone(digits: string): string {
  const d = digits.slice(0, 10);
  const parts = [
    ["(", d.slice(0, 3)],
    [d.length > 3 ? ") " : "", d.slice(3, 6)],
    [d.length > 6 ? "-" : "", d.slice(6, 8)],
    [d.length > 8 ? "-" : "", d.slice(8, 10)],
  ];
  return parts.map(([sep, chunk]) => (chunk ? sep + chunk : "")).join("");
}
