import { ForgotPasswordForm } from "#features/auth";

// Знание о том, какая строка в URL означает битую ссылку, живёт здесь: слой app
// только прокидывает searchParams, а трактовка — композиция страницы.
export function ForgotPassword({ error }: { error?: string }) {
  return <ForgotPasswordForm linkError={error === "invalid"} />;
}
