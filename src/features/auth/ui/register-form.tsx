"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegister } from "../model";
import { AuthCard } from "./auth-card";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { PasswordInput } from "#shared/ui/password-input";
import { Label } from "#shared/ui/label";
import { useT } from "#shared/i18n";
import { PASSWORD_MIN_LENGTH, ROUTES } from "#shared/config";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { register, isLoading, error } = useRegister();
  const t = useT();

  const handleRegister = () => {
    if (password.length < PASSWORD_MIN_LENGTH) {
      setValidationError(t.auth.passwordTooShort(PASSWORD_MIN_LENGTH));
      return;
    }
    if (password !== confirmPassword) {
      setValidationError(t.auth.passwordsMismatch);
      return;
    }
    setValidationError(null);
    register(email, password, fullName);
  };

  return (
    <AuthCard
      title={t.auth.createAccount}
      subtitle={t.auth.createSubtitle}
      footer={
        <>
          {t.auth.haveAccount}{" "}
          <Link href={ROUTES.LOGIN} className="font-medium text-violet-600">
            {t.auth.signIn}
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>{t.auth.fullName}</Label>
          <Input
            autoComplete="name"
            placeholder="Urzhan Rysbek"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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

        <div className="space-y-1.5">
          <Label>{t.auth.password}</Label>
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
          onClick={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? t.auth.creatingAccount : t.auth.createAccount}
        </Button>
      </div>
    </AuthCard>
  );
}
