import { useState, type FormEvent } from "react";
import { cn } from "../../lib/utils";

/** Category option for EOI form. */
export interface EOICategoryOption {
  /** Category value identifier. */
  value: string;
  /** Display label (i18n). */
  label: string;
}

/** Labels and text for the EOI form (all i18n-injectable). */
export interface EOIFormLabels {
  name: string;
  email: string;
  company: string;
  message: string;
  category: string;
  consent: string;
  updates: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  privacyUrl: string;
}

/** Data submitted by the EOI form. */
export interface EOIFormData {
  name: string;
  email: string;
  company: string;
  message: string;
  category: string;
  consent: boolean;
  updates: boolean;
}

/** Props for the EOIForm molecule */
export interface EOIFormProps {
  /** i18n labels for all form text. */
  labels: EOIFormLabels;
  /** Available EOI categories. */
  categories: EOICategoryOption[];
  /** Pre-selected category. */
  defaultCategory?: string;
  /** Form submission handler. */
  onSubmit: (data: EOIFormData) => Promise<void>;
  /** Additional CSS classes. */
  className?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

/**
 * EOIForm molecule — dynamic expression of interest form.
 *
 * Includes consent checkbox (required) and optional updates checkbox.
 * Honeypot field for spam prevention. Submission state management.
 * All labels accept i18n-translated strings.
 */
export function EOIForm({
  labels,
  categories,
  defaultCategory = "",
  onSubmit,
  className,
}: EOIFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [consent, setConsent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Check honeypot
    if (formData.get("website")) return;

    const data: EOIFormData = {
      name: (formData.get("name") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      company: (formData.get("company") as string) ?? "",
      message: (formData.get("message") as string) ?? "",
      category: (formData.get("category") as string) ?? "",
      consent: consent,
      updates: formData.get("updates") === "on",
    };

    setStatus("submitting");
    try {
      await onSubmit(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={cn("py-8 text-center", className)} role="status" aria-live="polite">
        <p className="text-sm text-foreground">{labels.success}</p>
      </div>
    );
  }

  const inputClasses = cn(
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
    "placeholder:text-muted-foreground",
    "focus:outline-2 focus:outline-offset-2 focus:outline-ring",
    "disabled:opacity-50",
  );

  return (
    <form onSubmit={handleSubmit} className={cn("relative flex flex-col gap-4", className)}>
      {/* Honeypot field — invisible to users, catches bots */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="eoi-name" className="text-sm font-medium text-foreground">
          {labels.name}
        </label>
        <input
          id="eoi-name"
          name="name"
          type="text"
          required
          disabled={status === "submitting"}
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="eoi-email" className="text-sm font-medium text-foreground">
          {labels.email}
        </label>
        <input
          id="eoi-email"
          name="email"
          type="email"
          required
          disabled={status === "submitting"}
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="eoi-company" className="text-sm font-medium text-foreground">
          {labels.company}
        </label>
        <input
          id="eoi-company"
          name="company"
          type="text"
          disabled={status === "submitting"}
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="eoi-category" className="text-sm font-medium text-foreground">
          {labels.category}
        </label>
        <select
          id="eoi-category"
          name="category"
          defaultValue={defaultCategory}
          disabled={status === "submitting"}
          className={inputClasses}
        >
          <option value="" />
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="eoi-message" className="text-sm font-medium text-foreground">
          {labels.message}
        </label>
        <textarea
          id="eoi-message"
          name="message"
          rows={4}
          disabled={status === "submitting"}
          className={inputClasses}
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          id="eoi-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={status === "submitting"}
          className="mt-0.5 rounded-sm border border-border"
        />
        <label htmlFor="eoi-consent" className="text-sm text-muted-foreground">
          {labels.consent}
        </label>
      </div>

      <div className="flex items-start gap-2">
        <input
          id="eoi-updates"
          name="updates"
          type="checkbox"
          disabled={status === "submitting"}
          className="mt-0.5 rounded-sm border border-border"
        />
        <label htmlFor="eoi-updates" className="text-sm text-muted-foreground">
          {labels.updates}
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">{labels.error}</p>
      )}

      <button
        type="submit"
        disabled={!consent || status === "submitting"}
        aria-disabled={!consent || status === "submitting"}
        className={cn(
          "inline-flex items-center justify-center px-4 py-2 text-sm font-medium",
          "bg-primary text-primary-foreground rounded-md",
          "transition-colors duration-150 hover:opacity-90",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        {status === "submitting" ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
