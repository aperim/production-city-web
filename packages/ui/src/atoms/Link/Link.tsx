import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

/**
 * Allowed URL schemes for security.
 * Rejects javascript:, data:, vbscript:, and other dangerous schemes.
 * Protocol-relative URLs (//evil.example) are also rejected.
 */
const ALLOWED_SCHEMES = /^(https?:|mailto:|tel:|#|\/(?:[^/]|$)|$)/i;

/**
 * Sanitises a URL by rejecting dangerous schemes.
 * Allowed: http://, https://, mailto:, tel:, relative paths (/foo), hash (#).
 * Blocked: javascript:, data:, vbscript:, protocol-relative (//evil.com).
 * Returns the safe URL or "#" if the URL is not allowed.
 */
function sanitizeHref(href: string | undefined): string {
  if (!href) return "#";
  const trimmed = href.trim();
  // Reject protocol-relative URLs that start with //
  if (trimmed.startsWith("//")) return "#";
  if (!ALLOWED_SCHEMES.test(trimmed)) return "#";
  return trimmed;
}

const linkVariants = cva(
  [
    "transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "rounded-xs",
  ].join(" "),
  {
    variants: {
      variant: {
        /**
         * Inline: styled as a text link within a paragraph.
         */
        inline:
          "text-primary underline underline-offset-4 hover:text-primary/80",
        /**
         * Standalone: a standalone call-to-action link, no underline by default.
         */
        standalone:
          "text-primary font-medium hover:underline hover:underline-offset-4",
        /**
         * External: standalone with an external icon indicator.
         */
        external:
          "text-primary font-medium hover:underline hover:underline-offset-4 inline-flex items-center gap-1",
      },
    },
    defaultVariants: {
      variant: "inline",
    },
  },
);

/** Props for the Link atom */
interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">,
    VariantProps<typeof linkVariants> {
  /**
   * The link URL. Only http/https/mailto/tel/relative URLs are allowed.
   * javascript: and data: URLs are silently rejected and replaced with "#".
   */
  href?: string;
  /**
   * Link text or child elements. Rendered as ReactNode only.
   */
  children: ReactNode;
  /**
   * When true, forces external link behaviour (target="_blank",
   * rel="noopener noreferrer") regardless of variant.
   */
  external?: boolean;
}

/**
 * Link atom - accessible anchor with URL scheme allowlist.
 *
 * Variants: inline, standalone, external.
 * External links automatically apply rel="noopener noreferrer".
 * Dangerous URLs (javascript:, data:) are silently replaced with "#".
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    variant = "inline",
    external = false,
    children,
    target,
    rel,
    className,
    ...props
  },
  ref,
) {
  const safeHref = sanitizeHref(href);

  const isExternal =
    external ||
    variant === "external" ||
    (safeHref.startsWith("http") && !safeHref.startsWith(typeof window !== "undefined" ? window.location.origin : ""));

  const resolvedTarget = target ?? (isExternal ? "_blank" : undefined);
  const resolvedRel =
    isExternal
      ? // rel="noopener noreferrer" cannot be removed or overridden for external links
        "noopener noreferrer"
      : rel;

  return (
    <a
      ref={ref}
      // Spread props before security-critical attrs so they cannot be overridden
      {...props}
      href={safeHref}
      target={resolvedTarget}
      rel={resolvedRel}
      className={cn(linkVariants({ variant }), className)}
    >
      {children}
      {isExternal && variant === "external" && (
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      )}
    </a>
  );
});

export { Link, linkVariants, sanitizeHref };
export type { LinkProps };
