"use client";

/**
 * Login page — email input + delivery status + code entry.
 * Inline transition between email and code views (no page navigation).
 * Identical UX for registered and unregistered emails (anti-enumeration).
 */

import { useCallback, useState } from "react";
import {
  AuthTemplate,
  LoginForm,
  MagicCodeForm,
  type DeliveryStatus,
} from "@productioncity/holding-ui";
import { requestMagicLink, verifyCode } from "../lib/api-client";
import { useDeliveryStatus } from "../lib/websocket/useDeliveryStatus";
import { useAuth } from "../lib/auth-context";

type LoginView = "email" | "code";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<LoginView>("email");
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
        setError("Something went wrong. Please try again.");
        }
      }
    },
    [],
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
        setCodeError(result.error.message || "Invalid code");
      }
    },
    [email],
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
        <p className="text-sm text-muted-foreground text-center">Loading...</p>
      </AuthTemplate>
    );
  }

  return (
    <AuthTemplate>
      {view === "email" ? (
        <LoginForm
          onSubmit={handleEmailSubmit}
          deliveryStatus={deliveryStatus}
          error={error}
          rateLimited={rateLimited}
          rateLimitMessage={rateLimitMessage}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <MagicCodeForm
            onSubmit={handleCodeSubmit}
            onResend={handleResend}
            deliveryStatus={deliveryStatus}
            error={codeError}
            locked={locked}
          />
          {timedOut && (
            <p className="text-xs text-muted-foreground">
              Verification is taking longer than expected. Please check your email
              for a sign-in link, or enter the code from the email above.
            </p>
          )}
          <button
            type="button"
            onClick={handleGoBack}
            className="self-start text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors duration-150"
          >
            Wrong email? Go back
          </button>
        </div>
      )}
    </AuthTemplate>
  );
}
