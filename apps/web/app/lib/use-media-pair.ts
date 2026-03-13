/**
 * Custom hook for fetching a media pair by content context.
 * Handles loading, error, and data states with AbortController cleanup.
 */

import { useState, useEffect } from "react";
import { fetchMediaPair } from "./api-client";
import type { MediaPairResponse } from "./api-client";

interface UseMediaPairResult {
  data: MediaPairResponse | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetch a media pair for a given content context.
 * Aborts in-flight requests on unmount or context change.
 */
export function useMediaPair(contentContext: string): UseMediaPairResult {
  const [data, setData] = useState<MediaPairResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchMediaPair(contentContext, { signal: controller.signal })
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
  }, [contentContext]);

  return { data, loading, error };
}
