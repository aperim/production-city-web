import {
  useState,
  useRef,
  useId,
  useEffect,
  type KeyboardEvent,
} from "react";
import { cn } from "../../lib/utils";

/** A language option for the switcher. */
export interface LanguageOption {
  /** ISO 639-1 language code (e.g., "en", "ar"). */
  code: string;
  /** Display label in native script (e.g., "English", "العربية"). */
  label: string;
}

/** Props for the LanguageSwitcher molecule */
export interface LanguageSwitcherProps {
  /** Available languages. */
  languages: LanguageOption[];
  /** Currently selected language code. */
  currentLanguage: string;
  /** Called when user selects a different language. */
  onLanguageChange: (code: string) => void;
  /** When true, the switcher is non-interactive. */
  disabled?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * LanguageSwitcher molecule — globe icon trigger with dropdown for language selection.
 *
 * Composes trigger button + floating menu with keyboard navigation.
 * RTL-aware positioning using CSS logical properties.
 */
export function LanguageSwitcher({
  languages,
  currentLanguage,
  onLanguageChange,
  disabled = false,
  className,
}: LanguageSwitcherProps) {
  const instanceId = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerId = `lang-trigger-${instanceId}`;
  const menuId = `lang-menu-${instanceId}`;

  const currentLabel = languages.find((l) => l.code === currentLanguage)?.label ?? currentLanguage;

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function selectLanguage(code: string) {
    onLanguageChange(code);
    close();
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  // Focus first item when menu opens
  useEffect(() => {
    if (open) {
      const firstItem = menuRef.current?.querySelector<HTMLElement>(
        '[role="menuitemradio"]',
      );
      firstItem?.focus();
    }
  }, [open]);

  function handleMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [],
    );
    const current = document.activeElement;
    const currentIndex = items.indexOf(current as HTMLElement);

    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(currentIndex + 1) % items.length];
      next?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[(currentIndex - 1 + items.length) % items.length];
      prev?.focus();
    }
    if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    }
    if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
    if (e.key === "Tab") {
      // Close menu but don't refocus trigger — let browser handle natural tab order
      setOpen(false);
    }
  }

  function handleTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label="Select language"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 text-sm",
          "border border-border rounded-md bg-background",
          "transition-colors duration-150 hover:bg-accent",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <span aria-hidden="true" className="text-base">🌐</span>
        <span>{currentLabel}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Languages"
          aria-labelledby={triggerId}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            "absolute top-full z-50 mt-1 min-w-40 rounded-md border border-border bg-background py-1 shadow-md",
            "end-0",
          )}
        >
          {languages.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                tabIndex={-1}
                onClick={() => selectLanguage(lang.code)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-sm text-start",
                  "focus:bg-accent focus:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  isSelected && "font-medium",
                )}
              >
                <span aria-hidden="true" className="w-4 shrink-0 text-xs">
                  {isSelected ? "✓" : ""}
                </span>
                {lang.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
