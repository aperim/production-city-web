"use client";

/**
 * Onboarding page — name collection for new users.
 * Simple form: name input + submit → PATCH /v1/auth/profile → redirect to /dashboard.
 */

import { useCallback, useId, useState, type FormEvent } from "react";
import { AuthTemplate } from "@productioncity/holding-ui";
import { updateProfile } from "../lib/api-client";
import { useAuth } from "../lib/auth-context";

export default function OnboardingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const instanceId = useId();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = name.trim();
      if (!trimmed || isSubmitting) return;

      setIsSubmitting(true);
      setError(undefined);

      try {
        const result = await updateProfile({ name: trimmed });
        if (result.ok) {
          if (typeof window !== "undefined") {
            window.location.href = "/dashboard";
          }
        } else {
          setError(result.error.message || "Something went wrong");
        }
      } catch {
        setError("Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, isSubmitting],
  );

  if (isLoading) {
    return (
      <AuthTemplate>
        <p className="text-sm text-muted-foreground text-center">Loading...</p>
      </AuthTemplate>
    );
  }

  return (
    <AuthTemplate>
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Onboarding"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Welcome</p>
          <p className="text-sm text-muted-foreground">
            What should we call you?
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${instanceId}-name`}
            className="text-sm font-medium text-foreground leading-none"
          >
            Name
          </label>
          <input
            id={`${instanceId}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            autoComplete="name"
            autoFocus
            className="w-full rounded-sm border border-border bg-background text-foreground px-3 text-sm h-9 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground"
          />
        </div>

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          aria-busy={isSubmitting}
          className="rounded-sm bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150 min-h-[44px]"
        >
          {isSubmitting ? "Saving..." : "Continue"}
        </button>
      </form>
    </AuthTemplate>
  );
}
