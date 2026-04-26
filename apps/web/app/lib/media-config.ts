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
  "home-hero": media("home-hero", "Film clapperboard in a professional production studio", "StockHouse Films llc", "https://www.pexels.com/@stockhouse-films-llc-1673449088", "#6C7175"),
  "home-facilities-preview": media("home-facilities-preview", "Film crew setting up a studio scene with professional lighting and equipment", "Ron Lach", "https://www.pexels.com/@ron-lach", "#5B2F2E"),
  "home-creative-preview": media("home-creative-preview", "Creative crew filming an interview on a professional set", "Gists And Thrills Studios", "https://www.pexels.com/@gistsandthrills", "#605655"),
  "home-vision-preview": media("home-vision-preview", "Tokyo skyline at dusk with dramatic clouds — global city presence", "Kuma Jio", "https://www.pexels.com/@kuma-jio-2150949207", "#5D7881"),

  // Facilities page
  "facilities-hero": media("facilities-hero", "Camera crane and dramatic production lighting in a large venue", "Filipe Braggio", "https://www.pexels.com/@filipe-braggio-57041688", "#0E0B20"),
  "facilities-screen-stage": media("facilities-screen-stage", "Film production clapperboard on a professional stage setting", "StockHouse Films llc", "https://www.pexels.com/@stockhouse-films-llc-1673449088", "#343539"),
  "facilities-commercial-stage": media("facilities-commercial-stage", "Professional photo shoot in a commercial studio with lighting rigs", "Matheus Bertelli", "https://www.pexels.com/@bertellifotografia", "#878B8E"),
  "facilities-broadcast-theatre": media("facilities-broadcast-theatre", "Empty auditorium theatre stage ready for performance", "Arto Suraj", "https://www.pexels.com/@artosuraj", "#3F3327"),
  "facilities-control-room": media("facilities-control-room", "Professional broadcast control room with multiple monitors and equipment", "Tahir Xəlfə", "https://www.pexels.com/@tahir", "#4E4A4B"),
  "facilities-ancillary": media("facilities-ancillary", "Recording studio and post-production workspace", "cottonbro studio", "https://www.pexels.com/@cottonbro", "#21262F"),

  // Creative page
  "creative-hero": media("creative-hero", "Engineering and creative team collaborating on a production project", "ThisIsEngineering", "https://www.pexels.com/@thisisengineering", "#97827D"),
  "creative-vfx": media("creative-vfx", "Visual effects performer on a green screen stage with motion tracking markers", "cottonbro studio", "https://www.pexels.com/@cottonbro", "#6A6D78"),
  "creative-motion-capture": media("creative-motion-capture", "Motion capture technology in action with professional performers on set", "Lisha Dunlap", "https://www.pexels.com/@lishadunlap", "#7B8779"),
  "creative-costume": media("creative-costume", "Costume designer fitting a garment on a model in a professional studio", "Antoni Shkraba Studio", "https://www.pexels.com/@shkrabaanthony", "#A49075"),
  "creative-post-production": media("creative-post-production", "Post-production editing suite with professional video editing software", "abdo alshreef", "https://www.pexels.com/@alshreef", "#1A1C29"),

  // Vision page
  "vision-hero": media("vision-hero", "Futuristic geometric architectural design representing innovation", "Engin Akyurt", "https://www.pexels.com/@enginakyurt", "#666666"),
  "vision-queensland": media("vision-queensland", "Aerial view of Queensland, Australia coastline — lush green hills meeting the ocean", "Caleb Russell", "https://www.pexels.com/@caleb-russell-1573299", "#787966"),
  "vision-global": media("vision-global", "Earth at night from space, city lights across Asia representing global connectivity", "Zelch Csaba", "https://www.pexels.com/@zelch", "#0F0B02"),

  // Community page
  "community-hero": media("community-hero", "Student learning and collaboration in an educational environment", "Arthur Krijgsman", "https://www.pexels.com/@artstel", "#AEA18E"),
  "community-sustainability": media("community-sustainability", "Solar panels on a field representing sustainable energy and environmental commitment", "Mark Stebnicki", "https://www.pexels.com/@nc-farm-bureau-mark", "#838592"),
  "community-education": media("community-education", "Students engaged in a hands-on robotics workshop learning environment", "Zeal Creative Studios", "https://www.pexels.com/@zeal-creative-studios-58866141", "#516274"),

  // FAQ page
  "faq-hero": media("faq-hero", "Professional reception and information area", "Andrea Piacquadio", "https://www.pexels.com/@olly", "#7C6C61"),

  // Contact page
  "contact-hero": media("contact-hero", "Professional meeting and business conversation", "Werner Pfennig", "https://www.pexels.com/@werner-pfennig", "#AEADAD"),

  // Network page
  "network-hero": media("network-hero", "Breathtaking aerial cityscape of Tokyo, Japan, illuminated at night with vibrant lights", "Michael Pointner", "https://www.pexels.com/@michael-pointner-134459625", "#1E1E26"),

  // Services page
  "services-hero": media("services-hero", "A professional film crew collaborates in a modern studio setting, focusing on high-quality production", "Minh Tri", "https://www.pexels.com/@minhtribgn", "#616765"),

  // Company approach page
  "company-approach-hero": media("company-approach-hero", "A spacious, modern interior with escalators in a silent architectural setting", "daydream", "https://www.pexels.com/@daydream-753072845", "#3A3A38"),

  // First Nations page (landscape — no portraiture)
  "first-nations-hero": media("first-nations-hero", "Desert sunset with silhouetted trees and birds in Witjira, South Australia — deep country", "Mark Direen", "https://www.pexels.com/@mark-direen-622749", "#665963"),
};

/** Get media source for a content context. Returns undefined if not found. */
export function getMedia(context: string): MediaSource | undefined {
  return MEDIA[context];
}
