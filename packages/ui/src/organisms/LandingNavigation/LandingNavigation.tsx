import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { sanitizeHref } from "../../atoms/Link/Link";
import { LanguageSwitcher, type LanguageOption } from "../../molecules/LanguageSwitcher/LanguageSwitcher";

/** A navigation link item. */
export interface NavLinkItem {
  /** Display label (i18n). */
  label: string;
  /** Link target. */
  href: string;
}

/** Optional auth/sign-in link for the navigation. */
export interface NavAuthLink {
  /** Display label (i18n) — e.g. "Sign in" or "Dashboard". */
  label: string;
  /** Link target — e.g. "/login" or "/dashboard". */
  href: string;
}

/** Props for the LandingNavigation organism */
export interface LandingNavigationProps {
  /** Brand text (no gradient backgrounds per Uncodixify). */
  brand: ReactNode;
  /** Navigation links. */
  links: NavLinkItem[];
  /** Available languages for the switcher. */
  languages: LanguageOption[];
  /** Current language code. */
  currentLanguage: string;
  /** Language change handler. */
  onLanguageChange: (code: string) => void;
  /** Current active path for active state indicator. */
  activePath?: string;
  /** Transparent background mode for hero overlay. Transitions to solid on scroll. */
  transparent?: boolean;
  /** Optional auth link (sign in / dashboard). Rendered right-aligned on desktop, bottom of mobile menu. */
  authLink?: NavAuthLink;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * LandingNavigation organism — top navigation bar for public landing pages.
 *
 * Supports transparent mode for hero overlay with scroll transition.
 * Mobile: full-screen overlay with focus trap (Finding #10).
 * Escape key closes mobile menu and restores focus to hamburger.
 */
export function LandingNavigation({
  brand,
  links,
  languages,
  currentLanguage,
  onLanguageChange,
  activePath,
  transparent = false,
  authLink,
  className,
}: LandingNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Scroll listener for transparent→solid transition
  useEffect(() => {
    if (!transparent) return;
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  // Focus trap for mobile overlay (Finding #10)
  useEffect(() => {
    if (!mobileOpen || !overlayRef.current) return;

    const overlay = overlayRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileOpen(false);
        hamburgerRef.current?.focus();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = overlay.querySelectorAll<HTMLElement>(focusableSelector);
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Lock body scroll
    document.body.style.overflow = "hidden";
    overlay.addEventListener("keydown", handleKeyDown);

    // Focus the close button on open
    const closeBtn = overlay.querySelector<HTMLElement>('button[aria-label="Close menu"]');
    closeBtn?.focus();

    return () => {
      document.body.style.overflow = "";
      overlay.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  const isTransparentNow = transparent && !scrolled && !mobileOpen;

  return (
    <nav
      className={cn(
        "border-b border-border transition-colors duration-200",
        isTransparentNow
          ? "border-transparent bg-transparent"
          : "bg-background",
        transparent && "fixed inset-x-0 top-0 z-40",
        className,
      )}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand with primary color accent */}
        <a href={sanitizeHref(links[0]?.href ?? "/")} className={cn(
          "flex items-center gap-2 text-base font-semibold",
          isTransparentNow ? "text-white" : "text-foreground",
        )}>
          <span className="inline-block h-5 w-1 rounded-sm bg-primary" aria-hidden="true" />
          {brand}
        </a>

        {/* Desktop links with active underline indicator */}
        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => {
            const isActive = activePath === link.href || (link.href !== "/" && activePath?.startsWith(link.href));
            return (
              <a
                key={link.href}
                href={sanitizeHref(link.href)}
                className={cn(
                  "text-sm transition-colors duration-150",
                  isActive
                    ? "font-medium underline underline-offset-4 decoration-primary decoration-2"
                    : "",
                  isTransparentNow
                    ? (isActive ? "text-white" : "text-white/80 hover:text-white")
                    : (isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"),
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </a>
            );
          })}
          <LanguageSwitcher
            languages={languages}
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
          {authLink && (
            <a
              href={sanitizeHref(authLink.href)}
              className={cn(
                "text-sm transition-colors duration-150",
                isTransparentNow
                  ? "text-white/80 hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {authLink.label}
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          ref={hamburgerRef}
          type="button"
          aria-label="Navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "inline-flex items-center justify-center p-2 lg:hidden",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            isTransparentNow ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {mobileOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile full-screen overlay — Finding #10: focus trap, Escape close */}
      {mobileOpen && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 flex flex-col bg-neutral-950 lg:hidden"
        >
          {/* Overlay header */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <a href={sanitizeHref(links[0]?.href ?? "/")} className="flex items-center gap-2 text-base font-semibold text-white">
              <span className="inline-block h-5 w-1 rounded-sm bg-primary" aria-hidden="true" />
              {brand}
            </a>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMobile}
              className="inline-flex items-center justify-center p-2 text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              ✕
            </button>
          </div>

          {/* Overlay links */}
          <div className="flex flex-1 flex-col items-start justify-center gap-6 px-8">
            {links.map((link) => {
              const isActive = activePath === link.href || (link.href !== "/" && activePath?.startsWith(link.href));
              return (
                <a
                  key={link.href}
                  href={sanitizeHref(link.href)}
                  onClick={closeMobile}
                  className={cn(
                    "text-lg transition-colors duration-150",
                    isActive
                      ? "font-medium text-white"
                      : "text-white/70 hover:text-white",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Overlay footer with auth link and language switcher */}
          <div className="border-t border-white/10 px-8 py-6">
            {authLink && (
              <a
                href={sanitizeHref(authLink.href)}
                onClick={closeMobile}
                className="mb-4 block text-sm text-white/70 transition-colors duration-150 hover:text-white"
              >
                {authLink.label}
              </a>
            )}
            <LanguageSwitcher
              languages={languages}
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
