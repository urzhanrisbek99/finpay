"use client";

import { useState } from "react";
import { useLogin } from "../model";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { PasswordInput } from "#shared/ui/password-input";
import { Label } from "#shared/ui/label";
import { useT } from "#shared/i18n";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useLogin();
  const t = useT();

  return (
    <div className="bg-muted flex min-h-screen items-center justify-center p-4">
      <div className="bg-background w-full max-w-sm rounded-xl border p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-lg font-medium text-white">
            ₸
          </div>
          <h1 className="text-lg font-medium">{t.auth.welcomeBack}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t.auth.signInSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t.auth.email}</Label>
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>{t.auth.password}</Label>
              <span className="cursor-pointer text-xs text-violet-600">
                {t.auth.forgotPassword}
              </span>
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

        <p className="text-muted-foreground mt-4 text-center text-xs">
          {t.auth.noAccount}{" "}
          <a href="/register" className="font-medium text-violet-600">
            {t.auth.signUp}
          </a>
        </p>
      </div>
    </div>
  );
}
