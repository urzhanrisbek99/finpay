"use client";

import { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "../model";
import { AuthCard } from "./auth-card";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { useT } from "#shared/i18n";
import { ROUTES } from "#shared/config";

// linkError приходит со страницы: /auth/confirm отправляет сюда, когда
// одноразовый секрет не сошёлся, чтобы человек сразу запросил новое письмо.
export function ForgotPasswordForm({
  linkError = false,
}: {
  linkError?: boolean;
}) {
  const [email, setEmail] = useState("");
  const { requestReset, isLoading, error, isSent } = useForgotPassword();
  const t = useT();

  return (
    <AuthCard
      title={isSent ? t.auth.checkYourEmail : t.auth.forgotTitle}
      subtitle={isSent ? t.auth.resetLinkSent : t.auth.forgotSubtitle}
      footer={
        <Link href={ROUTES.LOGIN} className="font-medium text-violet-600">
          {t.auth.backToSignIn}
        </Link>
      }
    >
      {!isSent && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t.auth.email}</Label>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {(error || linkError) && (
            <p className="text-xs text-red-600">
              {error || t.auth.resetLinkInvalid}
            </p>
          )}

          <Button
            className="w-full bg-violet-600 hover:bg-violet-700"
            onClick={() => requestReset(email)}
            disabled={isLoading || !email}
          >
            {isLoading ? t.auth.sendingResetLink : t.auth.sendResetLink}
          </Button>
        </div>
      )}
    </AuthCard>
  );
}
