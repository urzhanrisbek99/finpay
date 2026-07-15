"use client";

import { Popover } from "@base-ui/react/popover";
import { Settings, Check } from "lucide-react";
import { cn } from "#shared/lib";
import { LOCALES, useI18n, type Locale } from "#shared/i18n";

export function SettingsMenu() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Popover.Root>
      <Popover.Trigger
        title={t.settings.title}
        className="text-muted-foreground hover:text-foreground hover:bg-muted aria-expanded:bg-muted aria-expanded:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
      >
        <Settings size={18} />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="right" align="end" sideOffset={8}>
          <Popover.Popup className="bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 w-52 rounded-xl p-3 text-sm shadow-lg ring-1 duration-100 outline-none">
            <Popover.Title className="mb-2 text-sm font-medium">
              {t.settings.title}
            </Popover.Title>

            <p className="text-muted-foreground mb-1.5 text-xs">
              {t.settings.language}
            </p>
            <div className="flex flex-col gap-0.5">
              {LOCALES.map((code) => (
                <button
                  key={code}
                  onClick={() => setLocale(code as Locale)}
                  className={cn(
                    "hover:bg-muted flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
                    locale === code && "text-violet-600",
                  )}
                >
                  {t.localeName[code]}
                  {locale === code && <Check size={15} />}
                </button>
              ))}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
