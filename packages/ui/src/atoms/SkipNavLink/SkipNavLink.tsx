import { cn } from '../../lib/utils';

/** Props for the SkipNavLink atom */
export interface SkipNavLinkProps {
  /**
   * Target element id to jump to.
   * @default "main-content"
   */
  targetId?: string;
  /**
   * Link text.
   * @default "Skip to main content"
   */
  label?: string;
  /** Additional class names. */
  className?: string;
}

/**
 * SkipNavLink atom — visually hidden link that appears on focus.
 *
 * Allows keyboard users to skip past navigation and jump directly
 * to the main content area. WCAG 2.1 AA: 2.4.1 Bypass Blocks.
 */
export function SkipNavLink({
  targetId = 'main-content',
  label = 'Skip to main content',
  className,
}: SkipNavLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100]',
        'focus:rounded-sm focus:bg-primary focus:text-primary-foreground',
        'focus:px-4 focus:py-2 focus:text-sm focus:font-medium',
        'focus:outline-2 focus:outline-offset-2 focus:outline-ring',
        className,
      )}
    >
      {label}
    </a>
  );
}
