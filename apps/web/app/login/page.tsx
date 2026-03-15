"use client";

/**
 * Login page — email input + delivery status + code entry.
 * Inline transition between email and code views (no page navigation).
 * Identical UX for registered and unregistered emails (anti-enumeration).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AuthTemplate,
  LoginForm,
  MagicCodeForm,
  Skeleton,
  type DeliveryStatus,
} from "@productioncity/holding-ui";
import { requestMagicLink, verifyCode } from "../lib/api-client";
import { useDeliveryStatus } from "../lib/websocket/useDeliveryStatus";
import { useAuth } from "../lib/auth-context";
import { useTranslation } from "../i18n/context";

type LoginView = "email" | "code";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  const [view, setView] = useState<LoginView>("email");
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const emailFormRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [deliveryToken, setDeliveryToken] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | undefined>();
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | undefined>();
  const [locked, setLocked] = useState(false);

  const { status: pollingStatus, timedOut } = useDeliveryStatus(
    requestId,
    deliveryToken,
  );

  // Redirect if already authenticated
  if (!isLoading && isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  // Map polling status to DeliveryStatus for the UI components
  const deliveryStatus: DeliveryStatus | undefined = pollingStatus
    ? (pollingStatus as DeliveryStatus)
    : undefined;

  const handleEmailSubmit = useCallback(
    async (submittedEmail: string) => {
      setError(undefined);
      setRateLimited(false);

      const result = await requestMagicLink(submittedEmail);

      if (result.ok) {
        setEmail(submittedEmail);
        setRequestId(result.data.requestId);
        setDeliveryToken(result.data.deliveryToken);
        setView("code");
      } else {
        if (result.status === 429) {
          setRateLimited(true);
          setRateLimitMessage(result.error.message);
        } else {
          // Generic error — never reveal whether email is registered (anti-enumeration)
        setError(t("auth.login.genericError"));
        }
      }
    },
    [t],
  );

  const handleCodeSubmit = useCallback(
    async (code: string) => {
      setCodeError(undefined);

      const result = await verifyCode(email, code);

      if (result.ok) {
        if (typeof window !== "undefined") {
          window.location.href = result.data.redirectUrl;
        }
      } else {
        if (result.error.remainingAttempts !== undefined && result.error.remainingAttempts <= 0) {
          setLocked(true);
        }
        setCodeError(result.error.message || t("auth.login.invalidCode"));
      }
    },
    [email, t],
  );

  const handleResend = useCallback(() => {
    if (email) {
      setCodeError(undefined);
      setLocked(false);
      setRequestId(null);
      setDeliveryToken(null);
      requestMagicLink(email).then((result) => {
        if (result.ok) {
          setRequestId(result.data.requestId);
          setDeliveryToken(result.data.deliveryToken);
        }
      });
    }
  }, [email]);

  // Focus management: move focus to first input when view changes
  useEffect(() => {
    if (view === "code" && codeContainerRef.current) {
      const firstInput = codeContainerRef.current.querySelector<HTMLElement>("input");
      if (firstInput) {
        firstInput.focus();
      }
    } else if (view === "email" && emailFormRef.current) {
      const firstInput = emailFormRef.current.querySelector<HTMLElement>("input");
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [view]);

  const handleGoBack = useCallback(() => {
    setView("email");
    setEmail("");
    setRequestId(null);
    setDeliveryToken(null);
    setCodeError(undefined);
    setLocked(false);
    setError(undefined);
    setRateLimited(false);
  }, []);

  if (isLoading) {
    return (
      <AuthTemplate>
        <div className="flex flex-col gap-4" role="status">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" height={36} />
          <Skeleton variant="rectangular" height={44} />
          <span className="sr-only">{t("common.loading")}</span>
        </div>
      </AuthTemplate>
    );
  }

  return (
    <AuthTemplate>
      {view === "email" ? (
        <div ref={emailFormRef}>
        <LoginForm
          onSubmit={handleEmailSubmit}
          deliveryStatus={deliveryStatus}
          error={error}
          rateLimited={rateLimited}
          rateLimitMessage={rateLimitMessage || t("auth.login.rateLimitDefault")}
          emailLabel={t("auth.login.emailLabel")}
          submitLabel={t("auth.login.submitButton")}
          submittingLabel={t("auth.login.submitting")}
          ariaLabel={t("auth.login.title")}
        />
        </div>
      ) : (
        <div ref={codeContainerRef} className="flex flex-col gap-4">
          <MagicCodeForm
            onSubmit={handleCodeSubmit}
            onResend={handleResend}
            deliveryStatus={deliveryStatus}
            error={codeError}
            locked={locked}
            heading={t("auth.login.codeHeading")}
            description={t("auth.login.codeDescription")}
            resendLabel={t("auth.login.resendCode")}
            lockedMessage={t("auth.login.lockedMessage")}
            verifyingLabel={t("auth.login.verifying")}
          />
          {timedOut && (
            <p className="text-xs text-muted-foreground">
              {t("auth.login.timedOut")}
            </p>
          )}
          <button
            type="button"
            onClick={handleGoBack}
            className="self-start text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring transition-colors duration-150"
          >
            {t("auth.login.wrongEmail")}
          </button>
        </div>
      )}
    </AuthTemplate>
  );
}
