"use client";

/**
 * App Router error boundary — catches server and client render errors.
 *
 * Next.js/vinext automatically wraps each route segment with this
 * error boundary. It receives the error and a reset function.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-neutral-500">
        {error.digest ? `Error: ${error.digest}` : "Please try again later."}
      </p>
      <button
        className="mt-4 rounded-sm border border-neutral-300 px-4 py-2 text-sm"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
