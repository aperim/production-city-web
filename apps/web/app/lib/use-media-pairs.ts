/**
 * Custom hook for batch-fetching media pairs by content contexts.
 * Preferred over multiple useMediaPair calls to avoid N+1 waterfall.
 */

import { useState, useEffect } from "react";
import { fetchMediaPairs } from "./api-client";
import type { MediaPairResponse } from "./api-client";

interface UseMediaPairsResult {
  data: Record<string, MediaPairResponse>;
  loading: boolean;
  error: Error | null;
}

/**
 * Batch fetch media pairs for multiple content contexts in a single request.
 * Aborts in-flight requests on unmount or contexts change.
 */
export function useMediaPairs(contexts: string[]): UseMediaPairsResult {
  const [data, setData] = useState<Record<string, MediaPairResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Stable key for the contexts array
  const contextKey = contexts.join(",");

  useEffect(() => {
    if (contexts.length === 0) {
      setData({});
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchMediaPairs(contexts, { signal: controller.signal })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled && err instanceof Error && err.name !== "AbortError") {
          setError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [contextKey]);

  return { data, loading, error };
}
