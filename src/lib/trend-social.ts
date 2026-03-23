import type { StyleTag } from "@/lib/types";

/**
 * Curated “what’s trending” copy per tag. Social links open public hashtag / search pages
 * (no Instagram or TikTok API — users explore on those platforms).
 */
export type TrendPulse = {
  headline: string;
  tip: string;
  /** Instagram explore hashtag (no #) */
  igHashtag: string;
  /** TikTok search query */
  tiktokQuery: string;
};

export const TREND_BY_TAG: Record<StyleTag, TrendPulse> = {
  casual: {
    headline: "Quiet luxury & soft tailoring",
    tip: "Relaxed fits, neutral layers, and one statement accessory.",
    igHashtag: "casualstyle",
    tiktokQuery: "casual outfit ideas 2025",
  },
  formal: {
    headline: "Sharp silhouettes & evening polish",
    tip: "Structured blazers, monochrome suits, and minimal jewelry.",
    igHashtag: "formalwear",
    tiktokQuery: "formal outfit inspiration",
  },
  athletic: {
    headline: "Gorpcore & performance street",
    tip: "Technical fabrics, zip layers, and trail-ready sneakers.",
    igHashtag: "athleisure",
    tiktokQuery: "athletic streetwear trend",
  },
  streetwear: {
    headline: "Oversized layers & sneaker culture",
    tip: "Boxy tees, cargo, and bold graphics — balance with one quiet piece.",
    igHashtag: "streetwear",
    tiktokQuery: "streetwear outfit tiktok",
  },
  bohemian: {
    headline: "Earthy textures & flow",
    tip: "Maxi skirts, crochet, and warm metallics.",
    igHashtag: "bohostyle",
    tiktokQuery: "bohemian fashion 2025",
  },
  minimalist: {
    headline: "Clean lines & capsule thinking",
    tip: "Fewer pieces, perfect fit, and a restrained palette.",
    igHashtag: "minimalstyle",
    tiktokQuery: "minimalist outfit aesthetic",
  },
  vintage: {
    headline: "Retro revival & thrifted finds",
    tip: "Denim, leather, and era-specific prints mixed with modern cuts.",
    igHashtag: "vintagefashion",
    tiktokQuery: "vintage outfit ideas",
  },
  preppy: {
    headline: "Varsity & coastal polish",
    tip: "Knits, pleats, loafers, and crisp collars.",
    igHashtag: "preppystyle",
    tiktokQuery: "preppy outfit aesthetic",
  },
  elegant: {
    headline: "Red-carpet minimalism",
    tip: "Silk, drape, and refined heels or loafers.",
    igHashtag: "elegantstyle",
    tiktokQuery: "elegant outfit inspiration",
  },
};

export function instagramTagExploreUrl(hashtag: string): string {
  const h = hashtag.replace(/^#/, "").trim();
  return `https://www.instagram.com/explore/tags/${encodeURIComponent(h)}/`;
}

export function tiktokSearchUrl(query: string): string {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
}
