import { ForgotPasswordForm } from "#features/auth";

export function ForgotPassword({ error }: { error?: string }) {
  return <ForgotPasswordForm linkError={error === "invalid"} />;
}
