"use client";

/**
 * Magic link verification page — /auth/verify?token=...
 *
 * CRITICAL SECURITY:
 * - Referrer-Policy: no-referrer meta tag (prevent token leaking via referrer)
 * - No third-party resources loaded on this page
 * - Cookie-only auth (no JS token access)
 */

import { useEffect, useState } from "react";
import { AuthTemplate } from "@productioncity/holding-ui";
import { verifyToken } from "../../lib/api-client";

type VerifyState = "loading" | "success" | "error";

export default function VerifyPage() {
  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setState("error");
      setErrorMessage("No verification token provided.");
      return;
    }

    verifyToken(token).then((result) => {
      if (result.ok) {
        setState("success");
        window.location.href = result.data.redirectUrl;
      } else {
        setState("error");
        setErrorMessage(
          result.error.message || "Verification failed. Please try again.",
        );
      }
    }).catch(() => {
      setState("error");
      setErrorMessage("Verification failed. Please try again.");
    });
  }, []);

  return (
    <>
      {/* CRITICAL: Prevent token leaking via referrer header */}
      <meta name="referrer" content="no-referrer" />

      <AuthTemplate>
        {state === "loading" && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Verifying...</p>
          </div>
        )}

        {state === "success" && (
          <div className="text-center">
            <p className="text-sm text-foreground">Verified. Redirecting...</p>
          </div>
        )}

        {state === "error" && (
          <div className="text-center flex flex-col gap-3">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <a
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors duration-150"
            >
              Back to login
            </a>
          </div>
        )}
      </AuthTemplate>
    </>
  );
}
