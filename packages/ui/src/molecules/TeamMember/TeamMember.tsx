import { cn } from "../../lib/utils";

/** Props for the TeamMember molecule */
export interface TeamMemberProps {
  /** Team member name. */
  name: string;
  /** Role or title. */
  role: string;
  /** Optional brief description or bio. */
  description?: string;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * TeamMember molecule — displays name, role, and optional description.
 *
 * No decorative avatar borders or status rings per Uncodixify.
 */
export function TeamMember({
  name,
  role,
  description,
  className,
}: TeamMemberProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-sm font-semibold text-foreground">{name}</span>
      <span className="text-sm text-muted-foreground">{role}</span>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
