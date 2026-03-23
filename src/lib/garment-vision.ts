import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { z } from "zod";
import type { ClothingCategory, GarmentDetectionSuggestion, Season, StyleTag } from "@/lib/types";

const CATEGORIES: ClothingCategory[] = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
  "activewear",
  "formal",
];

const SEASONS: Season[] = ["spring", "summer", "fall", "winter", "all"];
const STYLES: StyleTag[] = [
  "casual",
  "formal",
  "athletic",
  "streetwear",
  "bohemian",
  "minimalist",
  "vintage",
  "preppy",
  "elegant",
];

const rawResponseSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string(),
  color: z.string().min(1).max(80),
  colorHex: z.string(),
  warmthLevel: z.number(),
  waterproof: z.boolean(),
  seasons: z.array(z.string()),
  style: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
});

const SYSTEM = `You are a fashion cataloging assistant. Look at the clothing or footwear item in the image.
Respond with ONLY valid JSON (no markdown fences) matching this shape:
{
  "name": "short display name, max 80 chars",
  "category": one of: tops, bottoms, dresses, outerwear, shoes, accessories, activewear, formal
  "color": "human-readable color name",
  "colorHex": "#RRGGBB" (dominant garment color),
  "warmthLevel": integer 1-5 (1=very light, 5=very warm),
  "waterproof": boolean (true if clearly rain/snow gear or technical shell),
  "seasons": array of at least one of: spring, summer, fall, winter, all
  "style": array of at least one of: casual, formal, athletic, streetwear, bohemian, minimalist, vintage, preppy, elegant (use key "style" not "styles")
}
If multiple items appear, describe the single most prominent garment. If unsure, pick the closest category.`;

function normalizeHex(input: string): string {
  const s = input.trim();
  const m = s.match(/^#?([0-9A-Fa-f]{6})$/i);
  if (m) return `#${m[1].toUpperCase()}`;
  return "#6B7280";
}

function normalizeCategory(raw: string): ClothingCategory {
  const r = raw.toLowerCase().trim().replace(/\s+/g, "_");
  if (CATEGORIES.includes(r as ClothingCategory)) return r as ClothingCategory;
  const aliases: Record<string, ClothingCategory> = {
    top: "tops",
    shirt: "tops",
    tee: "tops",
    t_shirt: "tops",
    blouse: "tops",
    sweater: "tops",
    hoodie: "tops",
    tank: "tops",
    pants: "bottoms",
    jeans: "bottoms",
    trousers: "bottoms",
    shorts: "bottoms",
    skirt: "bottoms",
    leggings: "bottoms",
    dress: "dresses",
    gown: "dresses",
    jumpsuit: "dresses",
    jacket: "outerwear",
    coat: "outerwear",
    blazer: "outerwear",
    parka: "outerwear",
    cardigan: "outerwear",
    sneaker: "shoes",
    sneakers: "shoes",
    shoe: "shoes",
    boots: "shoes",
    sandals: "shoes",
    heels: "shoes",
    loafer: "shoes",
    bag: "accessories",
    hat: "accessories",
    belt: "accessories",
    scarf: "accessories",
    jewelry: "accessories",
    watch: "accessories",
    athletic: "activewear",
    sportswear: "activewear",
    suit: "formal",
    tie: "formal",
  };
  return aliases[r] ?? "tops";
}

function filterSeasons(arr: string[]): Season[] {
  const set = new Set<Season>();
  for (const x of arr) {
    const k = x.toLowerCase().trim() as Season;
    if (SEASONS.includes(k)) set.add(k);
  }
  if (set.size === 0) return ["all"];
  return Array.from(set);
}

function filterStyles(arr: string[]): StyleTag[] {
  const set = new Set<StyleTag>();
  for (const x of arr) {
    const k = x.toLowerCase().trim() as StyleTag;
    if (STYLES.includes(k)) set.add(k);
  }
  if (set.size === 0) return ["casual"];
  return Array.from(set);
}

function parseRawToSuggestion(parsedJson: unknown): GarmentDetectionSuggestion {
  const raw = rawResponseSchema.safeParse(parsedJson);
  if (!raw.success) {
    throw new Error("Model JSON did not match expected shape");
  }

  const d = raw.data;
  const warmth = Math.min(5, Math.max(1, Math.round(d.warmthLevel)));
  const styleSource =
    d.style && d.style.length > 0 ? d.style : (d.styles ?? []);

  return {
    name: d.name.trim(),
    category: normalizeCategory(d.category),
    color: d.color.trim(),
    colorHex: normalizeHex(d.colorHex),
    warmthLevel: warmth,
    waterproof: Boolean(d.waterproof),
    season: filterSeasons(d.seasons),
    style: filterStyles(styleSource),
  };
}

/** Strip optional markdown code fences from model output. */
function extractJsonText(text: string): string {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  if (fence) return fence[1].trim();
  return trimmed;
}

function parseJsonFromModelText(text: string): unknown {
  const jsonStr = extractJsonText(text);
  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error("Model did not return valid JSON");
  }
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) {
    throw new Error("Gemini path expects a data:image/...;base64 URL");
  }
  return { mimeType: m[1], data: m[2] };
}

async function detectWithOpenAI(imageUrl: string): Promise<GarmentDetectionSuggestion> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey: key });

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_GARMENT_MODEL ?? "gpt-4o-mini",
    max_tokens: 500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this image and output the JSON object." },
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "low" },
          },
        ],
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("Empty model response");
  }

  const parsedJson = parseJsonFromModelText(text);
  return parseRawToSuggestion(parsedJson);
}

async function detectWithGemini(imageDataUrl: string): Promise<GarmentDetectionSuggestion> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const { mimeType, data } = parseDataUrl(imageDataUrl);
  const genAI = new GoogleGenerativeAI(key);
  const modelName = process.env.GEMINI_GARMENT_MODEL ?? "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 1024,
    },
  });

  const result = await model.generateContent([
    { text: `${SYSTEM}\n\nAnalyze this image and output only the JSON object.` },
    {
      inlineData: {
        mimeType,
        data,
      },
    },
  ]);

  const text = result.response.text();
  if (!text) {
    throw new Error("Empty Gemini response");
  }

  const parsedJson = parseJsonFromModelText(text);
  return parseRawToSuggestion(parsedJson);
}

export type GarmentVisionProvider = "gemini" | "openai";

/**
 * Infer garment metadata from an image URL (https, http, or data:image/...).
 * Prefers **Gemini** when `GEMINI_API_KEY` is set; otherwise uses **OpenAI** when `OPENAI_API_KEY` is set.
 */
export async function detectGarmentFromImageUrl(
  imageUrl: string
): Promise<{ suggestion: GarmentDetectionSuggestion; provider: GarmentVisionProvider }> {
  if (process.env.GEMINI_API_KEY) {
    const suggestion = await detectWithGemini(imageUrl);
    return { suggestion, provider: "gemini" };
  }
  if (process.env.OPENAI_API_KEY) {
    const suggestion = await detectWithOpenAI(imageUrl);
    return { suggestion, provider: "openai" };
  }
  throw new Error("Set GEMINI_API_KEY or OPENAI_API_KEY for garment detection");
}
