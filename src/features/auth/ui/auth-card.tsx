import type { ReactNode } from "react";

// Общий каркас для всех четырёх экранов входа. Живёт внутри слайса, а не в
// shared/ui: это брендинг auth-страниц, а не переиспользуемый примитив, и
// наружу через public API не выходит.
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="bg-muted flex min-h-screen items-center justify-center p-4">
      <div className="bg-background w-full max-w-sm rounded-xl border p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-lg font-medium text-white">
            ₸
          </div>
          <h1 className="text-lg font-medium">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        </div>

        {children}

        {footer && (
          <p className="text-muted-foreground mt-4 text-center text-xs">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
