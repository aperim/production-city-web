import React, { type ReactNode, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const cardVariants = cva(
  "rounded-sm bg-card text-card-foreground overflow-hidden",
  {
    variants: {
      variant: {
        default: "border border-border",
        outlined: "border border-border",
        elevated: "border border-border shadow-sm",
        interactive:
          "border border-border cursor-pointer transition-colors duration-150 hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/** Props for the Card molecule */
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * When true, renders the card as a button-like element for interactive use.
   * Automatically applies interactive variant.
   */
  asButton?: boolean;
  /**
   * Children for the card body.
   */
  children: ReactNode;
}

/**
 * Card molecule — a content container with header, body, and footer slots.
 *
 * Use sub-components: `Card.Header`, `Card.Body`, `Card.Footer`, `Card.Media`.
 */
export function Card({
  variant,
  asButton = false,
  className,
  children,
  onClick,
  ...props
}: CardProps) {
  if (asButton || onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }}
        className={cn(cardVariants({ variant: variant ?? "interactive" }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn(cardVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn("flex flex-col gap-1 border-b border-border px-4 py-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardBody({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn("px-4 py-4", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn("flex items-center border-t border-border px-4 py-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardMedia({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn("overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Media = CardMedia;
