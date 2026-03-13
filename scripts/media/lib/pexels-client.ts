/**
 * Typed Pexels API client.
 * Uses injected fetch for testability.
 */

import type {
  PexelsSearchResponse,
  PexelsVideoSearchResponse,
  PexelsSearchOptions,
} from "./types.js";

const PEXELS_API_BASE = "https://api.pexels.com";
const RATE_LIMIT_WARN_THRESHOLD = 0.2; // warn when < 20% remaining

type FetchFn = typeof globalThis.fetch;

export class PexelsClient {
  private apiKey: string;
  private fetchFn: FetchFn;

  constructor(apiKey: string, fetchFn: FetchFn = globalThis.fetch) {
    this.apiKey = apiKey;
    this.fetchFn = fetchFn;
  }

  async searchPhotos(
    options: PexelsSearchOptions,
  ): Promise<PexelsSearchResponse> {
    const url = new URL(`${PEXELS_API_BASE}/v1/search`);
    url.searchParams.set("query", options.query);
    if (options.perPage) url.searchParams.set("per_page", String(options.perPage));
    if (options.page) url.searchParams.set("page", String(options.page));
    if (options.orientation) url.searchParams.set("orientation", options.orientation);
    if (options.size) url.searchParams.set("size", options.size);
    if (options.color) url.searchParams.set("color", options.color);

    return this.request<PexelsSearchResponse>(url.toString());
  }

  async searchVideos(
    options: PexelsSearchOptions,
  ): Promise<PexelsVideoSearchResponse> {
    const url = new URL(`${PEXELS_API_BASE}/videos/search`);
    url.searchParams.set("query", options.query);
    if (options.perPage) url.searchParams.set("per_page", String(options.perPage));
    if (options.page) url.searchParams.set("page", String(options.page));
    if (options.orientation) url.searchParams.set("orientation", options.orientation);
    if (options.size) url.searchParams.set("size", options.size);

    return this.request<PexelsVideoSearchResponse>(url.toString());
  }

  private async request<T>(url: string): Promise<T> {
    const response = await this.fetchFn(url, {
      headers: { Authorization: this.apiKey },
    });

    this.checkRateLimits(response.headers);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          `Pexels API rate limit exceeded (429). Please wait before retrying.`,
        );
      }
      throw new Error(
        `Pexels API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as Promise<T>;
  }

  private checkRateLimits(headers: Headers): void {
    const remaining = headers.get("x-ratelimit-remaining");
    const limit = headers.get("x-ratelimit-limit");

    if (remaining !== null && limit !== null) {
      const remainingNum = parseInt(remaining, 10);
      const limitNum = parseInt(limit, 10);

      if (
        limitNum > 0 &&
        remainingNum / limitNum < RATE_LIMIT_WARN_THRESHOLD
      ) {
        console.warn(
          `Pexels API rate limit warning: ${remaining}/${limit} remaining (< ${RATE_LIMIT_WARN_THRESHOLD * 100}%)`,
        );
      }
    }
  }
}
