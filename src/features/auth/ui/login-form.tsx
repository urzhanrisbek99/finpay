"use client";

import { useState } from "react";
import { useLogin } from "../model";
import { Button } from "#shared/ui/button";
import { Input } from "#shared/ui/input";
import { Label } from "#shared/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useLogin();

  return (
    <div className="bg-muted flex min-h-screen items-center justify-center p-4">
      <div className="bg-background w-full max-w-sm rounded-xl border p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-lg font-medium text-white">
            ₸
          </div>
          <h1 className="text-lg font-medium">Welcome back</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to your FinPay account
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Password</Label>
              <span className="cursor-pointer text-xs text-violet-600">
                Forgot password?
              </span>
            </div>
            <Input
              type="password"
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
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>

        <p className="text-muted-foreground mt-4 text-center text-xs">
          Don&apos;t have an account?
          <a href="/register" className="font-medium text-violet-600">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
