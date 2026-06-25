"use client";

import { useState } from "react";
import { useRegister } from "../model/useRegister";
import { Button } from "@/src/shared/ui/button";
import { Input } from "@/src/shared/ui/input";
import { Label } from "@/src/shared/ui/label";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { register, isLoading, error } = useRegister();

  const handleRegister = () => {
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    setValidationError(null);
    register(email, password, fullName);
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="bg-background border rounded-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center text-lg font-medium mx-auto mb-3">
            ₸
          </div>
          <h1 className="text-lg font-medium">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start managing your finances
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input
              placeholder="Urzhan Rysbek"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

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
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Confirm password</Label>
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
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-violet-600 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
