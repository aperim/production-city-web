import { cn } from "../../lib/utils";
import { sanitizeHref } from "../../atoms/Link/Link";
import { LanguageSwitcher, type LanguageOption } from "../../molecules/LanguageSwitcher/LanguageSwitcher";

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
  /** Acknowledgement of country. */
  acknowledgement: string;
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
  /** Navigation link groups. */
  linkGroups: FooterLinkGroup[];
  /** Legal text. */
  legalText: FooterLegalText;
  /** Contact info. */
  contactInfo: FooterContactInfo;
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
 * Simple layout, minimal height per Uncodixify.
 * Grouped navigation, contact info, legal links, language switcher.
 */
export function LandingFooter({
  linkGroups,
  legalText,
  contactInfo,
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
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        {/* Link groups + contact */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {linkGroups.map((group) => (
            <div key={group.heading}>
              <h4 className="text-sm font-semibold text-foreground">{group.heading}</h4>
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
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
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

        {/* Bottom bar: legal + language */}
        <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">{legalText.copyright}</p>
            <p className="text-xs text-muted-foreground">{legalText.trademark}</p>
            <p className="text-xs text-muted-foreground">{legalText.acknowledgement}</p>
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
