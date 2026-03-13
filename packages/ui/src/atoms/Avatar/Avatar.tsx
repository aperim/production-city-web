import { cva, type VariantProps } from "class-variance-authority";
import {
  useState,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted select-none",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-[10px]",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const statusVariants = cva(
  "absolute rounded-full border-2 border-background",
  {
    variants: {
      status: {
        online: "bg-green-500",
        offline: "bg-muted-foreground",
        busy: "bg-destructive",
        away: "bg-amber-500",
      },
      size: {
        xs: "h-1.5 w-1.5 bottom-0 end-0",
        sm: "h-2 w-2 bottom-0 end-0",
        md: "h-2.5 w-2.5 bottom-0 end-0",
        lg: "h-3 w-3 bottom-0.5 end-0.5",
        xl: "h-3.5 w-3.5 bottom-0.5 end-0.5",
      },
    },
  },
);

type AvatarStatus = "online" | "offline" | "busy" | "away";
type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Props for the Avatar atom */
interface AvatarProps extends VariantProps<typeof avatarVariants> {
  /**
   * Image URL. Falls back to initials, then icon.
   */
  src?: string;
  /**
   * Alt text for the image variant. Required when src is provided.
   */
  alt?: string;
  /**
   * Initials rendered when no image is available.
   */
  initials?: string;
  /**
   * Icon rendered as final fallback when neither src nor initials are available.
   */
  icon?: ReactNode;
  /**
   * Status indicator shown as a dot on the avatar.
   */
  status?: AvatarStatus;
  /**
   * Accessible label for the status indicator (e.g. "Online").
   * If not provided, the status is hidden from AT.
   */
  statusLabel?: string;
  className?: string;
}

/**
 * Avatar atom - displays a user's image with initials and icon fallbacks.
 *
 * Sizes: xs, sm, md, lg, xl.
 * Supports status indicator (online, offline, busy, away).
 */
function Avatar({
  src,
  alt,
  initials,
  icon,
  size = "md",
  status,
  statusLabel,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;

  // Determine the accessible name and role for the container.
  // When the image is shown, the <img> alt handles the name — no role/label on the outer div.
  // When falling back to initials or icon, add role="img" so aria-label is valid (ARIA spec:
  // aria-label is prohibited on generic elements without a concrete role).
  // Priority: alt (explicit label) → initials (visible but AT-hidden, so reuse as label)
  // → "Avatar" (final generic fallback). Never leave role="img" without an accessible name.
  const containerLabel = showImage
    ? undefined
    : (alt ?? initials ?? "Avatar");

  return (
    <div
      className={cn(avatarVariants({ size }), className)}
      role={showImage ? undefined : "img"}
      aria-label={containerLabel}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? ""}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : initials ? (
        // Initials are always hidden from AT; the container's aria-label (or alt) is the name
        <span className="font-medium text-muted-foreground uppercase" aria-hidden="true">
          {initials.slice(0, 2)}
        </span>
      ) : icon ? (
        <span className="text-muted-foreground" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {status && (
        <span
          className={cn(statusVariants({ status, size: size as AvatarSize }))}
          aria-label={statusLabel}
          aria-hidden={statusLabel ? undefined : "true"}
          role={statusLabel ? "img" : undefined}
        />
      )}
    </div>
  );
}

/** Props for AvatarGroup */
interface AvatarGroupProps {
  /**
   * Avatar configurations to render in the stack.
   */
  avatars: AvatarProps[];
  /**
   * Maximum number of avatars to show before showing a "+N" indicator.
   */
  max?: number;
  size?: AvatarSize;
  className?: string;
}

/**
 * AvatarGroup atom - stacked avatar list with overflow count.
 *
 * Uses list semantics for accessibility, announces overflow count.
 */
function AvatarGroup({ avatars, max = 3, size = "md", className }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - visible.length;

  const overflowSizeClass: Record<AvatarSize, string> = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  return (
    <ul
      className={cn("flex items-center", className)}
      role="list"
      aria-label={`${avatars.length} avatar${avatars.length !== 1 ? "s" : ""}`}
    >
      {visible.map((props, index) => (
        <li
          key={index}
          className="-ms-2 first:ms-0"
          style={{ zIndex: visible.length - index }}
        >
          <Avatar
            {...props}
            size={size}
            className={cn(
              "ring-2 ring-background",
              props.className,
            )}
          />
        </li>
      ))}
      {overflow > 0 && (
        <li className="-ms-2" style={{ zIndex: 0 }}>
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-muted ring-2 ring-background",
              "font-medium text-muted-foreground",
              overflowSizeClass[size],
            )}
            aria-label={`${overflow} more`}
          >
            +{overflow}
          </div>
        </li>
      )}
    </ul>
  );
}

export { Avatar, AvatarGroup };
export type { AvatarProps, AvatarGroupProps, AvatarStatus, AvatarSize };
