import type { StyleTag } from "@/lib/types";

/**
 * Hand-curated creators & fashion accounts per style — **not** scraped from IG/TikTok.
 *
 * Why no scraping?
 * - Instagram / TikTok prohibit automated scraping in their ToS; they block bots and change HTML often.
 * - Official APIs (Meta Graph API, TikTok for Developers) are for apps you register; discovery of *other*
 *   people’s profiles at scale needs compliance review and often partnerships.
 *
 * **Operational model:** Edit this list (or later load from a CMS / your partner roster). Swap URLs anytime.
 * Optional future: YouTube Data API (search channels by keyword), paid influencer databases, or sponsor links.
 */
export type CuratedCreator = {
  name: string;
  handle: string;
  platform: "instagram" | "tiktok" | "youtube";
  /** Public profile or channel URL */
  url: string;
  /** One line — why they fit this aesthetic */
  why: string;
};

export const CREATOR_PICKS_BY_STYLE: Record<StyleTag, CuratedCreator[]> = {
  casual: [
    {
      name: "Who What Wear",
      handle: "@whowhatwear",
      platform: "instagram",
      url: "https://www.instagram.com/whowhatwear/",
      why: "Daily outfit ideas and accessible casual styling.",
    },
    {
      name: "Casual outfit ideas (TikTok search)",
      handle: "—",
      platform: "tiktok",
      url: "https://www.tiktok.com/search?q=casual%20outfit%20ideas",
      why: "Discover creators posting casual looks (public search).",
    },
  ],
  formal: [
    {
      name: "GQ",
      handle: "@gq",
      platform: "instagram",
      url: "https://www.instagram.com/gq/",
      why: "Suits, tailoring, and formal menswear editorials.",
    },
    {
      name: "Vogue",
      handle: "@vogue",
      platform: "instagram",
      url: "https://www.instagram.com/vogue/",
      why: "Runway and evening elegance references.",
    },
  ],
  athletic: [
    {
      name: "Nike",
      handle: "@nike",
      platform: "instagram",
      url: "https://www.instagram.com/nike/",
      why: "Performance styling and sport-led campaigns.",
    },
    {
      name: "Gym fit creators (TikTok search)",
      handle: "—",
      platform: "tiktok",
      url: "https://www.tiktok.com/search?q=gym%20outfit%20aesthetic",
      why: "Activewear and training fits from the community.",
    },
  ],
  streetwear: [
    {
      name: "Highsnobiety",
      handle: "@highsnobiety",
      platform: "instagram",
      url: "https://www.instagram.com/highsnobiety/",
      why: "Street culture, sneakers, and brand drops.",
    },
    {
      name: "Streetwear TikTok",
      handle: "—",
      platform: "tiktok",
      url: "https://www.tiktok.com/search?q=streetwear%20outfit",
      why: "Trending streetwear creators via public search.",
    },
  ],
  bohemian: [
    {
      name: "Free People",
      handle: "@freepeople",
      platform: "instagram",
      url: "https://www.instagram.com/freepeople/",
      why: "Flowing, boho-inspired seasonal styling.",
    },
    {
      name: "Boho style (TikTok search)",
      handle: "—",
      platform: "tiktok",
      url: "https://www.tiktok.com/search?q=boho%20outfit%20ideas",
      why: "Community boho and festival looks.",
    },
  ],
  minimalist: [
    {
      name: "COS",
      handle: "@cosstores",
      platform: "instagram",
      url: "https://www.instagram.com/cosstores/",
      why: "Clean silhouettes and restrained palettes.",
    },
    {
      name: "Minimal style (YouTube search)",
      handle: "—",
      platform: "youtube",
      url: "https://www.youtube.com/results?search_query=minimalist+capsule+wardrobe",
      why: "Capsule and minimal outfit breakdowns.",
    },
  ],
  vintage: [
    {
      name: "Beyond Retro",
      handle: "@beyondretro",
      platform: "instagram",
      url: "https://www.instagram.com/beyondretro/",
      why: "Vintage sourcing and thrift styling.",
    },
    {
      name: "Thrift flip (TikTok search)",
      handle: "—",
      platform: "tiktok",
      url: "https://www.tiktok.com/search?q=thrift%20vintage%20outfit",
      why: "Creators styling vintage finds.",
    },
  ],
  preppy: [
    {
      name: "J.Crew",
      handle: "@jcrew",
      platform: "instagram",
      url: "https://www.instagram.com/jcrew/",
      why: "Classic American prep and knits.",
    },
    {
      name: "Preppy aesthetic (TikTok search)",
      handle: "—",
      platform: "tiktok",
      url: "https://www.tiktok.com/search?q=preppy%20outfit",
      why: "Ivy and coastal prep inspiration.",
    },
  ],
  elegant: [
    {
      name: "Harper’s BAZAAR",
      handle: "@harpersbazaarus",
      platform: "instagram",
      url: "https://www.instagram.com/harpersbazaarus/",
      why: "Red-carpet and luxury fashion coverage.",
    },
    {
      name: "Elegant outfit (YouTube search)",
      handle: "—",
      platform: "youtube",
      url: "https://www.youtube.com/results?search_query=elegant+dressing+tutorial",
      why: "Tutorials and elegant styling breakdowns.",
    },
  ],
};

/** Creators for the tags the user cares about (deduped). */
export function creatorsForStyles(tags: StyleTag[]): CuratedCreator[] {
  const seen = new Set<string>();
  const out: CuratedCreator[] = [];
  for (const tag of tags) {
    for (const c of CREATOR_PICKS_BY_STYLE[tag] ?? []) {
      const key = `${c.platform}:${c.url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}
