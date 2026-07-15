"use client";

import { useState } from "react";
import { useResetPassword } from "../model";
import { AuthCard } from "./auth-card";
import { Button } from "#shared/ui/button";
import { PasswordInput } from "#shared/ui/password-input";
import { Label } from "#shared/ui/label";
import { useT } from "#shared/i18n";
import { PASSWORD_MIN_LENGTH } from "#shared/config";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resetPassword, isLoading, error } = useResetPassword();
  const t = useT();

  const handleSubmit = () => {
    if (password.length < PASSWORD_MIN_LENGTH) {
      setValidationError(t.auth.passwordTooShort(PASSWORD_MIN_LENGTH));
      return;
    }
    if (password !== confirmPassword) {
      setValidationError(t.auth.passwordsMismatch);
      return;
    }
    setValidationError(null);
    resetPassword(password);
  };

  return (
    <AuthCard title={t.auth.resetTitle} subtitle={t.auth.resetSubtitle}>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>{t.auth.newPassword}</Label>
          <PasswordInput
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>{t.auth.confirmPassword}</Label>
          <PasswordInput
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {(error || validationError) && (
          <p className="text-xs text-red-600">{error || validationError}</p>
        )}

        <Button
          className="w-full bg-violet-600 hover:bg-violet-700"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? t.auth.updatingPassword : t.auth.updatePassword}
        </Button>
      </div>
    </AuthCard>
  );
}
