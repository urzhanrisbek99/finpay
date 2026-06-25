"use client";

import { useState } from "react";
import { useLogin } from "../model/useLogin";
import { Button } from "@/src/shared/ui/button";
import { Input } from "@/src/shared/ui/input";
import { Label } from "@/src/shared/ui/label";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useLogin();

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="bg-background border rounded-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center text-lg font-medium mx-auto mb-3">
            ₸
          </div>
          <h1 className="text-lg font-medium">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
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
            <div className="flex justify-between items-center">
              <Label>Password</Label>
              <span className="text-xs text-violet-600 cursor-pointer">
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

        <p className="text-center text-xs text-muted-foreground mt-4">
          Don&apos;t have an account?
          <a href="/register" className="text-violet-600 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
