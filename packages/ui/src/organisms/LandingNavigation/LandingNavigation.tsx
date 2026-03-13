import { useState, type ReactNode } from "react";
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
  /** Additional CSS classes. */
  className?: string;
}

/**
 * LandingNavigation organism — top navigation bar for public landing pages.
 *
 * Simple border-bottom, no dramatic shadows or transform animations.
 * Mobile hamburger at <1024px with simple opacity fade.
 */
export function LandingNavigation({
  brand,
  links,
  languages,
  currentLanguage,
  onLanguageChange,
  className,
}: LandingNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className={cn(
        "border-b border-border bg-background",
        className,
      )}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <span className="text-base font-semibold text-foreground">{brand}</span>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={sanitizeHref(link.href)}
              className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <LanguageSwitcher
            languages={languages}
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "inline-flex items-center justify-center p-2 lg:hidden",
            "text-muted-foreground hover:text-foreground",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
        >
          {mobileOpen ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={sanitizeHref(link.href)}
                className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <LanguageSwitcher
                languages={languages}
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
