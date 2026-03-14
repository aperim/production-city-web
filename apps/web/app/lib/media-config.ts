/**
 * Media configuration — maps content contexts to file paths and attribution.
 * All media is local (no hotlinking). Paths are relative to /public/.
 * Attribution data sourced from .meta.json sidecar files (Pexels pipeline).
 */

export interface MediaSource {
  /** Light theme image path */
  lightSrc: string;
  /** Dark theme image path */
  darkSrc: string;
  /** Alt text for the image */
  alt: string;
  /** Photographer name for attribution */
  photographer: string;
  /** Photographer profile URL */
  photographerUrl?: string;
  /** Source platform */
  source: string;
  /** Source platform URL */
  sourceUrl?: string;
  /** Image width */
  width: number;
  /** Image height */
  height: number;
  /** Average color for skeleton */
  averageColor?: string;
}

function media(
  context: string,
  alt: string,
  photographer: string,
  photographerUrl: string,
  averageColor?: string,
): MediaSource {
  return {
    lightSrc: `/media/${context}/light.jpg`,
    darkSrc: `/media/${context}/dark.jpg`,
    alt,
    photographer,
    photographerUrl,
    source: "Pexels",
    sourceUrl: "https://www.pexels.com",
    width: 1920,
    height: 1080,
    averageColor,
  };
}

/** All media sources by content context */
export const MEDIA: Record<string, MediaSource> = {
  // Home page
  "home-hero": media("home-hero", "Production City — cinematic production facility", "khezez | \u062E\u0632\u0627\u0632", "https://www.pexels.com/@khezez", "#1a1a2e"),
  "home-facilities-preview": media("home-facilities-preview", "Sound stage interior with LED volume wall", "Engin Akyurt", "https://www.pexels.com/@enginakyurt", "#0f172a"),
  "home-creative-preview": media("home-creative-preview", "Creative professionals collaborating on set", "Amar Preciado", "https://www.pexels.com/@amar", "#1e293b"),
  "home-vision-preview": media("home-vision-preview", "Modern campus and global cityscape", "Pierre Blach\u00e9", "https://www.pexels.com/@pierre-blache-651604", "#0c4a6e"),

  // Facilities page
  "facilities-hero": media("facilities-hero", "Large-scale sound stage with dramatic lighting", "David Barber", "https://www.pexels.com/@david-barber-97607179", "#0f172a"),
  "facilities-screen-stage": media("facilities-screen-stage", "Film production on a professional sound stage", "Amar Preciado", "https://www.pexels.com/@amar", "#1a1a2e"),
  "facilities-commercial-stage": media("facilities-commercial-stage", "Commercial photography studio setup", "Amar Preciado", "https://www.pexels.com/@amar", "#1e293b"),
  "facilities-broadcast-theatre": media("facilities-broadcast-theatre", "Live performance theatre venue", "Kelly", "https://www.pexels.com/@kelly", "#1c1917"),
  "facilities-control-room": media("facilities-control-room", "Broadcast control room with monitors", "Jimmy Tom\u00e1s", "https://www.pexels.com/@jimmy-tomas-1203335", "#0f172a"),
  "facilities-ancillary": media("facilities-ancillary", "Recording studio and workshop space", "RDNE Stock project", "https://www.pexels.com/@rdne", "#1e293b"),

  // Creative page
  "creative-hero": media("creative-hero", "Diverse creative team working on production", "Darlene Alderson", "https://www.pexels.com/@darlene-alderson", "#1a1a2e"),
  "creative-vfx": media("creative-vfx", "Visual effects and CGI production", "Egor Komarov", "https://www.pexels.com/@egorkomarov", "#0f172a"),
  "creative-motion-capture": media("creative-motion-capture", "Motion capture studio with performers", "Skyler Ewing", "https://www.pexels.com/@skyler-ewing-266953", "#1e293b"),
  "creative-costume": media("creative-costume", "Costume design and wardrobe department", "Max W", "https://www.pexels.com/@max-w-1673439416", "#292524"),
  "creative-post-production": media("creative-post-production", "Post-production editing suite", "Muhammed \u00c7etinkaya", "https://www.pexels.com/@muhammed-cetinkaya-470437330", "#0f172a"),

  // Vision page
  "vision-hero": media("vision-hero", "Innovation center and modern campus", "Mindaugas Skrupskelis", "https://www.pexels.com/@mindaugasskrupskelis", "#0c4a6e"),
  "vision-queensland": media("vision-queensland", "Queensland, Australia coastline", "Josh Withers", "https://www.pexels.com/@hellojoshwithers", "#0369a1"),
  "vision-global": media("vision-global", "Global network and connectivity", "Efrem Efre", "https://www.pexels.com/@efrem-efre-2786187", "#1e293b"),

  // Community page
  "community-hero": media("community-hero", "Education and learning environment", "Max Fischer", "https://www.pexels.com/@max-fischer", "#1a1a2e"),
  "community-sustainability": media("community-sustainability", "Sustainable building with solar panels", "Engin Akyurt", "https://www.pexels.com/@enginakyurt", "#14532d"),
  "community-education": media("community-education", "University workshop setting", "ThisIsEngineering", "https://www.pexels.com/@thisisengineering", "#1e293b"),

  // FAQ page
  "faq-hero": media("faq-hero", "Information and help desk", "Kelly", "https://www.pexels.com/@kelly", "#1e293b"),

  // Contact page
  "contact-hero": media("contact-hero", "Professional meeting and conversation", "Edmond Dant\u00e8s", "https://www.pexels.com/@edmond-dantes", "#1a1a2e"),
};

/** Get media source for a content context. Returns undefined if not found. */
export function getMedia(context: string): MediaSource | undefined {
  return MEDIA[context];
}
