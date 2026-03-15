import { useCallback, useState, type FormEvent } from "react";
import { cn } from "../../lib/utils";

/** Props for the ProfileForm molecule */
export interface ProfileFormProps {
  /** Current user name (pre-fills the input) */
  defaultName: string;
  /** Called with the new name when the form is submitted */
  onSubmit: (name: string) => Promise<void>;
  /** Labels for i18n */
  labels?: {
    nameLabel?: string;
    saveButton?: string;
    saving?: string;
    saved?: string;
  };
  /** Additional class names */
  className?: string;
}

/**
 * ProfileForm molecule — inline name editing with save button.
 * Shows success/error feedback inline (no toast).
 */
export function ProfileForm({
  defaultName,
  onSubmit,
  labels,
  className,
}: ProfileFormProps) {
  const [name, setName] = useState(defaultName);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = name.trim();
      if (!trimmed) {
        setError("Name cannot be empty");
        setStatus("error");
        return;
      }

      setStatus("saving");
      setError(null);

      try {
        await onSubmit(trimmed);
        setStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setStatus("idle"), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setStatus("error");
      }
    },
    [name, onSubmit],
  );

  const nameLabel = labels?.nameLabel ?? "Display name";
  const saveButton = labels?.saveButton ?? "Save";
  const savingText = labels?.saving ?? "Saving...";
  const savedText = labels?.saved ?? "Saved";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-3", className)}
      data-testid="profile-form"
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="profile-name"
          className="text-sm font-medium text-foreground"
        >
          {nameLabel}
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (status === "error") {
              setError(null);
              setStatus("idle");
            }
          }}
          maxLength={100}
          className="w-full max-w-xs rounded-sm border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-invalid={status === "error"}
          aria-describedby={error ? "profile-name-error" : undefined}
        />
      </div>

      {status === "error" && error && (
        <p
          id="profile-name-error"
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      )}

      {status === "saved" && (
        <p className="text-xs text-muted-foreground" role="status">
          {savedText}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-sm border border-border bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors duration-150 disabled:opacity-50"
        >
          {status === "saving" ? savingText : saveButton}
        </button>
      </div>
    </form>
  );
}
