export function formatCurrency(amount: number): string {
  return (
    new Intl.NumberFormat("ru-KZ", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount) + " ₸"
  );
}

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

export function formatCardNumber(number: string): string {
  const last4 = number.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function isValidPhone(digits: string): boolean {
  return /^7\d{9}$/.test(digits);
}

export function formatCardInput(digits: string): string {
  return (
    digits
      .replace(/\D/g, "")
      .slice(0, 16)
      .match(/.{1,4}/g)
      ?.join(" ") ?? ""
  );
}

// валидный номер карты: ровно 16 цифр (формат, без проверки Луна — как isValidPhone)
export function isValidCardNumber(digits: string): boolean {
  return /^\d{16}$/.test(digits.replace(/\D/g, ""));
}

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
