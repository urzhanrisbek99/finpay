import { ForgotPassword } from "#pages/forgot-password";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <ForgotPassword error={error} />;
}
