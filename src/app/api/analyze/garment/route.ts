import { NextResponse } from "next/server";
import { z } from "zod";
import { detectGarmentFromImageUrl } from "@/lib/garment-vision";
import { getUserIdOr401 } from "@/lib/require-auth";

/** Vision + fetch can exceed default serverless timeout on some hosts. */
export const maxDuration = 60;

const bodySchema = z.object({
  imageUrl: z.string().min(10).max(2_500_000),
});

const MAX_FETCH_BYTES = 5 * 1024 * 1024;

/**
 * Normalize image to a data URL so Gemini (inline) and OpenAI (url or data) both work.
 */
async function ensureImageUrlForModel(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("data:image/")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("https://")) {
    const res = await fetch(imageUrl, { next: { revalidate: 0 } });
    if (!res.ok) {
      throw new Error(`Could not fetch image (${res.status})`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_FETCH_BYTES) {
      throw new Error("Image too large for analysis");
    }
    const ct = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
    if (!ct.startsWith("image/")) {
      throw new Error("URL did not return an image");
    }
    return `data:${ct};base64,${buf.toString("base64")}`;
  }
  if (imageUrl.startsWith("http://")) {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Could not fetch image (${res.status})`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_FETCH_BYTES) throw new Error("Image too large");
    const ct = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
    return `data:${ct};base64,${buf.toString("base64")}`;
  }
  throw new Error("Unsupported imageUrl (use https URL or data:image/...)");
}

export async function POST(req: Request) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Garment detection is not configured. Set GEMINI_API_KEY (recommended) or OPENAI_API_KEY.",
        code: "MISSING_VISION_KEYS",
      },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let modelUrl: string;
  try {
    modelUrl = await ensureImageUrlForModel(parsed.data.imageUrl);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Image resolution failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const { suggestion, provider } = await detectGarmentFromImageUrl(modelUrl);
    return NextResponse.json({ suggestion, provider });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Detection failed";
    console.error("[analyze/garment]", e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
