import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { LandingNavigation, type LandingNavigationProps } from "../../organisms/LandingNavigation/LandingNavigation";
import { LandingFooter, type LandingFooterProps } from "../../organisms/LandingFooter/LandingFooter";

/** Props for the LandingPageTemplate */
export interface LandingPageTemplateProps {
  /** Navigation props. */
  nav: LandingNavigationProps;
  /** Footer props. */
  footer: LandingFooterProps;
  /** Page content. */
  children: ReactNode;
  /** Additional CSS classes for the outer wrapper. */
  className?: string;
}

/**
 * LandingPageTemplate — base template for ALL public landing pages.
 *
 * Presentational only. Does NOT manage <html>, <head>, or meta tags
 * (those belong in apps/web layout per #139).
 *
 * Includes skip-to-content link for WCAG 2.4.1 compliance.
 * Max-width 1400px, centered per Uncodixify.
 */
export function LandingPageTemplate({
  nav,
  footer,
  children,
  className,
}: LandingPageTemplateProps) {
  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground"
      >
        Skip to main content
      </a>
      <LandingNavigation {...nav} />
      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          {children}
        </div>
      </main>
      <LandingFooter {...footer} />
    </div>
  );
}
