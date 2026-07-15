"use client";

import { useState } from "react";
import { useRegister } from "../model";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";
import { useT } from "#shared/i18n";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { register, isLoading, error } = useRegister();
  const t = useT();

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setValidationError(t.auth.passwordsMismatch);
      return;
    }
    setValidationError(null);
    register(email, password, fullName);
  };

  return (
    <div className="bg-muted flex min-h-screen items-center justify-center p-4">
      <div className="bg-background w-full max-w-sm rounded-xl border p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-lg font-medium text-white">
            ₸
          </div>
          <h1 className="text-lg font-medium">{t.auth.createAccount}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t.auth.createSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t.auth.fullName}</Label>
            <Input
              placeholder="Urzhan Rysbek"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

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
            <Label>{t.auth.password}</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t.auth.confirmPassword}</Label>
            <Input
              type="password"
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

        <p className="text-muted-foreground mt-4 text-center text-xs">
          {t.auth.haveAccount}{" "}
          <a href="/login" className="font-medium text-violet-600">
            {t.auth.signIn}
          </a>
        </p>
      </div>
    </div>
  );
}
