"use client";

import { useState } from "react";
import Link from "next/link";
import { useLogin } from "../model";
import { AuthCard } from "./auth-card";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { PasswordInput } from "#shared/ui/password-input";
import { Label } from "#shared/ui/label";
import { useT } from "#shared/i18n";
import { ROUTES } from "#shared/config";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useLogin();
  const t = useT();

  return (
    <AuthCard
      title={t.auth.welcomeBack}
      subtitle={t.auth.signInSubtitle}
      footer={
        <>
          {t.auth.noAccount}{" "}
          <Link href={ROUTES.REGISTER} className="font-medium text-violet-600">
            {t.auth.signUp}
          </Link>
        </>
      }
    >
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>{t.auth.password}</Label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-medium text-violet-600"
            >
              {t.auth.forgotPassword}
            </Link>
          </div>
          <PasswordInput
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button
          className="w-full bg-violet-600 hover:bg-violet-700"
          onClick={() => login(email, password)}
          disabled={isLoading}
        >
          {isLoading ? t.auth.signingIn : t.auth.signIn}
        </Button>
      </div>
    </AuthCard>
  );
}
