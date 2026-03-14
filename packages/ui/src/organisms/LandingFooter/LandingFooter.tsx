import { cn } from "../../lib/utils";
import { sanitizeHref } from "../../atoms/Link/Link";
import { LanguageSwitcher, type LanguageOption } from "../../molecules/LanguageSwitcher/LanguageSwitcher";
import { AcknowledgementOfCountry } from "../../molecules/AcknowledgementOfCountry/AcknowledgementOfCountry";

/** A link in the footer. */
export interface FooterLink {
  /** Display label (i18n). */
  label: string;
  /** Link target. */
  href: string;
}

/** A group of footer links with a heading. */
export interface FooterLinkGroup {
  /** Group heading (i18n). */
  heading: string;
  /** Links in this group. */
  links: FooterLink[];
}

/** Legal text content (all i18n). */
export interface FooterLegalText {
  /** Copyright line. */
  copyright: string;
  /** Trademark notice. */
  trademark: string;
  /** Acknowledgement of country body text. */
  acknowledgement: string;
  /** Acknowledgement of country heading. */
  acknowledgementHeading?: string;
}

/** Contact information. */
export interface FooterContactInfo {
  /** Email address. */
  email: string;
  /** AU phone number. */
  phoneAU: string;
  /** US phone number. */
  phoneUS: string;
}

/** Props for the LandingFooter organism */
export interface LandingFooterProps {
  /** Brand name. */
  brandName?: string;
  /** Brand tagline (i18n). */
  brandTagline?: string;
  /** Navigation link groups. */
  linkGroups: FooterLinkGroup[];
  /** Legal text. */
  legalText: FooterLegalText;
  /** Contact info. */
  contactInfo: FooterContactInfo;
  /** Contact heading (i18n). */
  contactHeading?: string;
  /** Legal page links (privacy, terms). */
  legalLinks: FooterLink[];
  /** Available languages. */
  languages: LanguageOption[];
  /** Current language code. */
  currentLanguage: string;
  /** Language change handler. */
  onLanguageChange: (code: string) => void;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * LandingFooter organism — site footer for all landing pages.
 *
 * Brand accent divider at top per issue #243.
 * Simple layout, minimal height per Uncodixify.
 * Grouped navigation, contact info, legal links, language switcher.
 */
export function LandingFooter({
  brandName,
  brandTagline,
  linkGroups,
  legalText,
  contactInfo,
  contactHeading,
  legalLinks,
  languages,
  currentLanguage,
  onLanguageChange,
  className,
}: LandingFooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-border bg-background",
        className,
      )}
      role="contentinfo"
    >
      {/* Brand accent divider at top */}
      <div
        data-testid="brand-accent-divider"
        className="h-1 bg-primary"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {/* Brand identity */}
        {brandName && (
          <div className="mb-8 flex items-center gap-2">
            <span className="inline-block h-6 w-1 rounded-sm bg-primary" aria-hidden="true" />
            <div>
              <p className="text-base font-semibold text-foreground">{brandName}</p>
              {brandTagline && (
                <p className="text-sm text-muted-foreground">{brandTagline}</p>
              )}
            </div>
          </div>
        )}

        {/* Link groups + contact */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {linkGroups.map((group) => (
            <div key={group.heading}>
              <p className="text-sm font-semibold text-foreground">{group.heading}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={sanitizeHref(link.href)}
                      className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-sm font-semibold text-foreground">{contactHeading ?? "Contact"}</p>
            <ul className="mt-3 flex flex-col gap-2">
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li className="text-sm text-muted-foreground">{contactInfo.phoneAU}</li>
              <li className="text-sm text-muted-foreground">{contactInfo.phoneUS}</li>
            </ul>
          </div>
        </div>

        {/* Acknowledgement of Country — shared molecule with compact mode */}
        <div className="mt-8 border-t border-border pt-6">
          <AcknowledgementOfCountry
            heading={legalText.acknowledgementHeading ?? "Acknowledgement of Country"}
            text={legalText.acknowledgement}
            compact
          />
        </div>

        {/* Bottom bar: legal + language */}
        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">{legalText.copyright}</p>
            <p className="text-xs text-muted-foreground">{legalText.trademark}</p>
          </div>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <a
                key={link.href}
                href={sanitizeHref(link.href)}
                className="text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
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
        </div>
      </div>
    </footer>
  );
}
