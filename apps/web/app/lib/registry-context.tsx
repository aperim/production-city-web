"use client";

/**
 * RegistryProvider — React context providing filtered registry data to all dashboard components.
 *
 * Fetches GET /v1/registry/visible from api.production.city (direct, never proxied).
 * Intersects returned visible_feature_ids with build-time route manifest.
 * Provides: visibleFeatures, currentPhase, registryVersion, isLoading, error
 *
 * - Version mismatch triggers single-shot page refresh (sessionStorage flag prevents loop)
 * - Fail-closed: on error, clears cached visible features
 * - 401 → redirect to sign-in with redirect param
 * - Exponential backoff retry (max 3 attempts)
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

export type Phase =
  | "company_formation"
  | "site_acquisition"
  | "planning_approvals"
  | "design_construct"
  | "pre_operations"
  | "operations"
  | "expansion";

export interface RegistryContextValue {
  visibleFeatures: Set<string>;
  currentPhase: Phase;
  registryVersion: string;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
}

const RegistryContext = createContext<RegistryContextValue | null>(null);

/** API base URL — same as api-client.ts */
const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "production.city"
    ? "https://api.production.city"
    : "";

const SESSION_REFRESH_KEY = "pc-registry-refreshed";
const CACHE_DURATION_MS = 5 * 60 * 1000;

interface VisibleResponse {
  registry_version: string;
  phase: Phase;
  visible_feature_ids: string[];
}

export interface RegistryProviderProps {
  children: ReactNode;
  /** SHA-256 hash embedded at build time (from route manifest). */
  buildRegistryVersion: string;
  /** All feature IDs from the build-time route manifest (for intersection). */
  manifestFeatureIds: Set<string>;
}

export function RegistryProvider({
  children,
  buildRegistryVersion,
  manifestFeatureIds,
}: RegistryProviderProps) {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<string>>(new Set());
  const [currentPhase, setCurrentPhase] = useState<Phase>("company_formation");
  const [registryVersion, setRegistryVersion] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const retryCountRef = useRef(0);
  const lastFetchRef = useRef(0);
  const fetchingRef = useRef(false);

  const fetchRegistry = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;

    // Prevent refetch within cache window
    if (Date.now() - lastFetchRef.current < CACHE_DURATION_MS && !error) {
      return;
    }

    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/v1/registry/visible`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (res.status === 401) {
        const redirect = encodeURIComponent(
          window.location.pathname + window.location.search,
        );
        window.location.href = `/sign-in?redirect=${redirect}`;
        return;
      }

      if (!res.ok) {
        throw new Error(`Registry fetch failed: ${res.status}`);
      }

      const data = (await res.json()) as VisibleResponse;

      // Intersect API response with build-time manifest
      const intersected = new Set<string>();
      for (const id of data.visible_feature_ids) {
        if (manifestFeatureIds.has(id)) {
          intersected.add(id);
        }
      }

      setVisibleFeatures(intersected);
      setCurrentPhase(data.phase);
      setRegistryVersion(data.registry_version);
      lastFetchRef.current = Date.now();
      retryCountRef.current = 0;

      // Version mismatch → single-shot refresh (prevents infinite loop during deploys)
      if (
        buildRegistryVersion &&
        data.registry_version !== buildRegistryVersion &&
        typeof sessionStorage !== "undefined" &&
        !sessionStorage.getItem(SESSION_REFRESH_KEY)
      ) {
        sessionStorage.setItem(SESSION_REFRESH_KEY, "1");
        window.location.reload();
        return;
      }
    } catch (err) {
      // Fail closed: clear cached visible features
      setVisibleFeatures(new Set());
      setError(err instanceof Error ? err : new Error(String(err)));

      // Exponential backoff retry (max 3 attempts)
      if (retryCountRef.current < 3) {
        const delay = Math.pow(2, retryCountRef.current) * 1000;
        retryCountRef.current++;
        setTimeout(fetchRegistry, delay);
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [buildRegistryVersion, manifestFeatureIds, error]);

  useEffect(() => {
    fetchRegistry();
  }, [fetchRegistry]);

  const retry = useCallback(() => {
    retryCountRef.current = 0;
    lastFetchRef.current = 0;
    fetchRegistry();
  }, [fetchRegistry]);

  return (
    <RegistryContext.Provider
      value={{
        visibleFeatures,
        currentPhase,
        registryVersion,
        isLoading,
        error,
        retry,
      }}
    >
      {children}
    </RegistryContext.Provider>
  );
}

/**
 * Hook to access registry context. Must be used within RegistryProvider.
 */
export function useRegistry(): RegistryContextValue {
  const ctx = useContext(RegistryContext);
  if (!ctx) {
    throw new Error("useRegistry must be used within a RegistryProvider");
  }
  return ctx;
}
