"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "#shared/ui/input";
import { useT } from "#shared/i18n";
import { cn } from "#shared/lib";

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [isVisible, setIsVisible] = React.useState(false);
  const t = useT();

  return (
    <div className="relative">
      {/* Раскрытый пароль живёт в type="text", а такое поле браузер отдаёт
          проверке орфографии (Chrome Enhanced Spell Check, Microsoft Editor
          шлют содержимое на свои серверы) и правит автокоррекцией на мобильных.
          type="password" от этого защищён сам, text — нет. */}
      <Input
        type={isVisible ? "text" : "password"}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="none"
        className={cn("pr-8", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        disabled={props.disabled}
        aria-label={t.auth.showPassword}
        aria-pressed={isVisible}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 flex items-center rounded-r-lg px-2.5 transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50"
      >
        {isVisible ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
