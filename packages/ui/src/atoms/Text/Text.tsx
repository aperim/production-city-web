import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Allowed semantic elements for the Text atom */
type TextElement = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "caption";

/** Props for the Text atom */
interface TextProps extends HTMLAttributes<HTMLElement> {
  /** The HTML element to render. Defaults to "p". */
  as?: TextElement;
  children: ReactNode;
  className?: string;
}

const elementStyles: Record<TextElement, string> = {
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold tracking-tight",
  h3: "text-xl font-semibold",
  h4: "text-lg font-medium",
  p: "text-base leading-relaxed",
  span: "text-base",
  caption: "text-sm text-muted-foreground",
};

/**
 * Text atom — polymorphic typography component.
 *
 * Renders the correct semantic HTML element based on the `as` prop.
 * Provides consistent typography styles across the design system.
 *
 * Note: When using `as="caption"`, the component must be a direct child
 * of a `<table>` element for valid HTML.
 */
function Text({ as = "p", children, className, ...props }: TextProps) {
  const Component = as;
  return (
    <Component className={cn(elementStyles[as], className)} {...props}>
      {children}
    </Component>
  );
}

export { Text };
export type { TextProps, TextElement };
