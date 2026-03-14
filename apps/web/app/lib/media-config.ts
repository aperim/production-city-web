/**
 * Media configuration — maps content contexts to file paths.
 * All media is local (no hotlinking). Paths are relative to /public/.
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

function media(context: string, alt: string, averageColor?: string): MediaSource {
  return {
    lightSrc: `/media/${context}/light.jpg`,
    darkSrc: `/media/${context}/dark.jpg`,
    alt,
    photographer: "Placeholder",
    photographerUrl: undefined,
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
  "home-hero": media("home-hero", "Production City — cinematic production facility", "#1a1a2e"),
  "home-facilities-preview": media("home-facilities-preview", "Sound stage interior with LED volume wall", "#0f172a"),
  "home-creative-preview": media("home-creative-preview", "Creative professionals collaborating on set", "#1e293b"),
  "home-vision-preview": media("home-vision-preview", "Modern campus and global cityscape", "#0c4a6e"),

  // Facilities page
  "facilities-hero": media("facilities-hero", "Large-scale sound stage with dramatic lighting", "#0f172a"),
  "facilities-screen-stage": media("facilities-screen-stage", "Film production on a professional sound stage", "#1a1a2e"),
  "facilities-commercial-stage": media("facilities-commercial-stage", "Commercial photography studio setup", "#1e293b"),
  "facilities-broadcast-theatre": media("facilities-broadcast-theatre", "Live performance theatre venue", "#1c1917"),
  "facilities-control-room": media("facilities-control-room", "Broadcast control room with monitors", "#0f172a"),
  "facilities-ancillary": media("facilities-ancillary", "Recording studio and workshop space", "#1e293b"),

  // Creative page
  "creative-hero": media("creative-hero", "Diverse creative team working on production", "#1a1a2e"),
  "creative-vfx": media("creative-vfx", "Visual effects and CGI production", "#0f172a"),
  "creative-motion-capture": media("creative-motion-capture", "Motion capture studio with performers", "#1e293b"),
  "creative-costume": media("creative-costume", "Costume design and wardrobe department", "#292524"),
  "creative-post-production": media("creative-post-production", "Post-production editing suite", "#0f172a"),

  // Vision page
  "vision-hero": media("vision-hero", "Innovation center and modern campus", "#0c4a6e"),
  "vision-queensland": media("vision-queensland", "Queensland, Australia coastline", "#0369a1"),
  "vision-global": media("vision-global", "Global network and connectivity", "#1e293b"),

  // Community page
  "community-hero": media("community-hero", "Education and learning environment", "#1a1a2e"),
  "community-sustainability": media("community-sustainability", "Sustainable building with solar panels", "#14532d"),
  "community-education": media("community-education", "University workshop setting", "#1e293b"),

  // FAQ page
  "faq-hero": media("faq-hero", "Information and help desk", "#1e293b"),

  // Contact page
  "contact-hero": media("contact-hero", "Professional meeting and conversation", "#1a1a2e"),
};

/** Get media source for a content context. Returns undefined if not found. */
export function getMedia(context: string): MediaSource | undefined {
  return MEDIA[context];
}
