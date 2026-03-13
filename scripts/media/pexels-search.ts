/**
 * Search Pexels API, return structured results.
 * Executable via: node --experimental-transform-types --experimental-detect-module scripts/media/pexels-search.ts
 */

import { PexelsClient } from "./lib/pexels-client.js";
import type { PexelsPhoto, PexelsSearchOptions } from "./lib/types.js";

type FetchFn = typeof globalThis.fetch;

/**
 * Search Pexels for photos matching the given options.
 * Results are filtered client-side by minimum resolution if specified.
 */
export async function searchPexels(
  options: PexelsSearchOptions,
  apiKey: string,
  fetchFn?: FetchFn,
): Promise<PexelsPhoto[]> {
  const client = new PexelsClient(apiKey, fetchFn);
  const response = await client.searchPhotos(options);

  let photos = response.photos;

  // Client-side filtering by minimum resolution
  if (options.minWidth || options.minHeight) {
    photos = photos.filter((photo) => {
      if (options.minWidth && photo.width < options.minWidth) return false;
      if (options.minHeight && photo.height < options.minHeight) return false;
      return true;
    });
  }

  return photos;
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const query = process.argv[2];
  if (!query) {
    console.error("Usage: pexels-search.ts <query> [orientation] [perPage]");
    process.exit(1);
  }

  const apiKey = process.env.PEXELS_API;
  if (!apiKey) {
    console.error("PEXELS_API environment variable is required");
    process.exit(1);
  }

  const orientation = process.argv[3] as
    | "landscape"
    | "portrait"
    | "square"
    | undefined;
  const perPage = process.argv[4] ? parseInt(process.argv[4], 10) : 5;

  const results = await searchPexels(
    { query, orientation, perPage },
    apiKey,
  );

  console.log(JSON.stringify(results, null, 2));
}
