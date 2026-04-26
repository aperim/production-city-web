/**
 * Subscription confirmation page.
 * Route: /subscriptions/confirm?token=...
 *
 * Security requirements:
 * - Strips token from URL via history.replaceState immediately
 * - Sets Referrer-Policy: no-referrer via meta tag
 * - Zero external resources
 * - Generic error messages (no token oracle)
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { confirmSubscription } from "../lib/api-client";
import { I18nProvider, useTranslation } from "../i18n/context";

export function SubscriptionConfirmPage() {
  return (
    <I18nProvider>
      <SubscriptionConfirmPageContent />
    </I18nProvider>
  );
}

function SubscriptionConfirmPageContent() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    // Extract token BEFORE stripping from URL
    const params = new URLSearchParams(window.location.search);
    tokenRef.current = params.get("token");

    // SECURITY: Strip token from URL immediately
    window.history.replaceState(null, "", window.location.pathname);

    if (!tokenRef.current) {
      setStatus("error");
      setMessage(t("subscriptions.confirm.error"));
      return;
    }

    confirmSubscription(tokenRef.current).then((result) => {
      if (result.ok) {
        setStatus("success");
        setMessage(result.data.message);
      } else {
        // Generic error — do NOT differentiate between error types (prevents token oracle)
        setStatus("error");
        setMessage(t("subscriptions.confirm.error"));
      }
    }).catch(() => {
      setStatus("error");
      setMessage(t("subscriptions.confirm.error"));
    });
  }, []);

  const heading = status === "success"
    ? t("subscriptions.confirm.title")
    : t("subscriptions.confirm.failedTitle");

  return (
    <>
      {/* SECURITY: Prevent referrer leakage */}
      <meta name="referrer" content="no-referrer" />

      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
          {/* Branding */}
          <div className="mb-6">
            <p className="text-lg font-semibold text-foreground">Production City</p>
          </div>

          {status === "loading" && (
            <div className="animate-pulse">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted mb-4" />
              <div className="h-4 w-3/4 mx-auto rounded bg-muted" />
            </div>
          )}

          {(status === "success" || status === "error") && (
            <>
              {status === "success" ? (
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-900/20 text-green-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/20 text-red-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <h1 id="subscription-confirm-heading" className="text-lg font-semibold text-foreground mb-2">{heading}</h1>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <a
                href="/announcements"
                className="text-sm font-medium text-primary underline underline-offset-4"
              >
                {status === "success" ? t("subscriptions.confirm.viewUpdates") : t("announcements.detail.back")}
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
