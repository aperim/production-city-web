/**
 * Unsubscribe page — two-step flow.
 * Route: /subscriptions/unsubscribe?token=...
 *
 * Security requirements (CRITICAL):
 * - Two-step: GET renders confirmation, POST performs unsubscribe
 * - Strips token from URL immediately
 * - Referrer-Policy: no-referrer
 * - Zero external resources
 * - Does NOT auto-unsubscribe on GET (prevents mail scanner/prefetch/link-unfurler)
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { unsubscribeByToken } from "../lib/api-client";
import { I18nProvider, useTranslation } from "../i18n/context";
import type { SupportedLocale } from "../i18n/index.js";


interface SubscriptionUnsubscribePageProps {
  serverLocale?: SupportedLocale;
}

export function SubscriptionUnsubscribePage({ serverLocale }: SubscriptionUnsubscribePageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <SubscriptionUnsubscribePageContent />
    </I18nProvider>
  );
}

function SubscriptionUnsubscribePageContent() {
  const { t } = useTranslation();
  const [step, setStep] = useState<"confirm" | "processing" | "success" | "error">("confirm");
  const [message, setMessage] = useState("");
  const tokenRef = useRef<string | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    // Extract token BEFORE stripping from URL
    const params = new URLSearchParams(window.location.search);
    tokenRef.current = params.get("token");

    // SECURITY: Strip token from URL immediately
    window.history.replaceState(null, "", window.location.pathname);

    if (!tokenRef.current) {
      setTokenMissing(true);
      setStep("error");
      setMessage(t("subscriptions.unsubscribe.error"));
    }
  }, []);

  // Step 2: User clicks "Confirm Unsubscribe" button → POST
  const handleUnsubscribe = useCallback(async () => {
    if (!tokenRef.current) return;

    setStep("processing");

    try {
      const result = await unsubscribeByToken(tokenRef.current);
      if (result.ok) {
        setStep("success");
        setMessage(t("subscriptions.unsubscribe.success"));
      } else {
        setStep("error");
        setMessage(t("subscriptions.unsubscribe.error"));
      }
    } catch {
      setStep("error");
      setMessage(t("subscriptions.unsubscribe.error"));
    }
  }, []);

  const heading = step === "confirm" && !tokenMissing
    ? t("subscriptions.unsubscribe.title")
    : step === "success"
      ? t("subscriptions.unsubscribe.successTitle")
      : t("subscriptions.unsubscribe.errorTitle");

  return (
    <>
      {/* SECURITY: Prevent referrer leakage */}
      <meta name="referrer" content="no-referrer" />

      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
          <div className="mb-6">
            <p className="text-lg font-semibold text-foreground">{t("brand.name")}</p>
          </div>

          {/* Heading — single h1 for all states */}
          {step !== "processing" && (
            <h1 id="subscription-unsubscribe-heading" className="text-lg font-semibold text-foreground mb-2">{heading}</h1>
          )}

          {/* Step 1: Confirmation prompt — GET is read-only */}
          {step === "confirm" && !tokenMissing && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {t("subscriptions.unsubscribe.confirmMessage")}
              </p>
              <button
                type="button"
                onClick={handleUnsubscribe}
                className="rounded-md border border-red-800/50 bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/40 transition-colors duration-150"
              >
                {t("subscriptions.unsubscribe.button")}
              </button>
              <div className="mt-4">
                <a
                  href="/announcements"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  {t("common.cancel")}
                </a>
              </div>
            </>
          )}

          {/* Processing */}
          {step === "processing" && (
            <div className="animate-pulse">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted mb-4" />
              <div className="h-4 w-3/4 mx-auto rounded bg-muted" />
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-900/20 text-green-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <a
                href="/settings/subscriptions"
                className="text-sm font-medium text-primary underline underline-offset-4"
              >
                {t("subscriptions.unsubscribe.managePreferences")}
              </a>
            </>
          )}

          {/* Error */}
          {step === "error" && (
            <>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <a
                href="/announcements"
                className="text-sm font-medium text-primary underline underline-offset-4"
              >
                {t("announcements.detail.back")}
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
