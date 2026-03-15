import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Props for the BidiIsolate atom. */
export interface BidiIsolateProps {
  /** Content to isolate directionally. */
  children: ReactNode;
  /** Optional direction override. Defaults to "auto". */
  dir?: "ltr" | "rtl" | "auto";
  /** Additional CSS classes. */
  className?: string;
  /** Language hint for screen readers (e.g., "en" for English brand names in Arabic text). */
  lang?: string;
}

/**
 * BidiIsolate atom — wraps content in a `<bdi>` element for correct
 * rendering of mixed-direction content in RTL contexts.
 *
 * Use cases: phone numbers, email addresses, URLs, and brand names
 * within Arabic RTL text.
 */
export function BidiIsolate({ children, dir = "auto", className, lang }: BidiIsolateProps) {
  return (
    <bdi dir={dir} className={cn(className)} lang={lang}>
      {children}
    </bdi>
  );
}
