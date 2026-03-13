import { useState, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";
import { ImageSkeleton } from "../../atoms/ImageSkeleton/ImageSkeleton";

/**
 * Validates that a URL is a local path or same-origin.
 * Rejects external URLs (third-party hotlinking), protocol-relative
 * URLs, data: URIs, blob: URIs, and javascript: schemes.
 */
function isLocalSource(src: string): boolean {
  const trimmed = src.trim();

  // Reject protocol-relative URLs (//evil.example)
  if (trimmed.startsWith("//")) return false;

  // Reject dangerous and non-HTTP schemes
  if (/^(javascript|data|blob|vbscript):/i.test(trimmed)) return false;

  // Relative paths starting with / (but not //) are local
  if (trimmed.startsWith("/")) return true;

  // Absolute HTTP(S) URLs: allow same-origin only in browser
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    if (typeof window !== "undefined") {
      try {
        const url = new URL(trimmed);
        return url.origin === window.location.origin;
      } catch {
        return false;
      }
    }
    // During SSR, reject absolute URLs to avoid hydration mismatch
    return false;
  }

  // Reject anything with a scheme separator
  if (trimmed.includes("://")) return false;

  // Plain relative paths (e.g., "media/photo.jpg") are local
  return true;
}

/**
 * Hook to detect current theme from data-theme attribute or system preference.
 */
function useTheme(): "light" | "dark" {
  const getInitialTheme = (): "light" | "dark" => {
    if (typeof document === "undefined") return "dark";
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    return "dark";
  };

  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute("data-theme");
      if (current === "light" || current === "dark") setTheme(current);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // matchMedia may not be available in test environments (jsdom)
    const mediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (!document.documentElement.hasAttribute("data-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery?.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery?.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return theme;
}

/** Props for the ThemedImage molecule */
interface ThemedImageProps {
  /** Image source for light theme */
  lightSrc: string;
  /** Image source for dark theme (falls back to lightSrc) */
  darkSrc?: string;
  /** Alt text for the image */
  alt: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Average color for skeleton placeholder */
  averageColor?: string;
  /** Loading strategy */
  loading?: "lazy" | "eager";
  /** Fetch priority hint */
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}

/**
 * ThemedImage molecule — image that switches between light/dark variants.
 *
 * Reads theme from data-theme attribute with prefers-color-scheme fallback.
 * Shows ImageSkeleton while loading, error state on failure.
 * Validates that sources are local paths (no third-party hotlinking).
 */
function ThemedImage({
  lightSrc,
  darkSrc,
  alt,
  width,
  height,
  averageColor,
  loading = "lazy",
  fetchPriority = "auto",
  className,
}: ThemedImageProps) {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Validate sources
  const lightValid = isLocalSource(lightSrc);
  const darkValid = darkSrc ? isLocalSource(darkSrc) : true;
  const hasExternalUrl = !lightValid || !darkValid;

  if (hasExternalUrl) {
    // Log warning for monitoring
    console.warn(
      `ThemedImage: rejected external URL. Only local paths (/media/...) or same-origin URLs are allowed.`,
    );
  }

  const activeSrc = hasExternalUrl
    ? undefined
    : theme === "dark" && darkSrc
      ? darkSrc
      : lightSrc;

  const inactiveSrc = hasExternalUrl
    ? undefined
    : theme === "dark"
      ? lightSrc
      : darkSrc;

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Reset loading state when src changes
  useEffect(() => {
    if (activeSrc) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [activeSrc]);

  if (hasExternalUrl || hasError) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-md bg-muted text-muted-foreground text-sm",
          className,
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
        data-loading="false"
      >
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-md", className)}
      data-loading={isLoading ? "true" : "false"}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <ImageSkeleton
            width={width}
            height={height}
            averageColor={averageColor}
          />
        </div>
      )}
      <img
        src={activeSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "block w-full h-auto",
          isLoading && "invisible",
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
      />
      {/* Preload inactive variant via hidden img */}
      {inactiveSrc && (
        <img
          aria-hidden="true"
          src={inactiveSrc}
          alt=""
          data-preload="true"
          className="hidden"
        />
      )}
    </div>
  );
}

export { ThemedImage, useTheme, isLocalSource };
export type { ThemedImageProps };
