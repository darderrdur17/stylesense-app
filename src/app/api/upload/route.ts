import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getUserIdOr401 } from "@/lib/require-auth";
import { parseExifFromBuffer } from "@/lib/server-exif";
import { reverseGeocodePlace } from "@/lib/server-geocode";

const MAX_INLINE = 900_000;

async function exifPayload(buf: Buffer) {
  const parsed = await parseExifFromBuffer(buf);
  let placeLabel: string | null = null;
  if (parsed.latitude != null && parsed.longitude != null) {
    placeLabel = await reverseGeocodePlace(parsed.latitude, parsed.longitude);
  }
  if (!parsed.dateIso && parsed.latitude == null && !placeLabel) {
    return undefined;
  }
  return {
    dateIso: parsed.dateIso,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    placeLabel,
  };
}

export async function POST(req: Request) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected file field" }, { status: 400 });
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 4MB)" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const exif = await exifPayload(buf);

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const blob = await put(file.name || `wardrobe-${Date.now()}.jpg`, buf, {
      access: "public",
      token,
    });
    return NextResponse.json({ url: blob.url, exif });
  }

  if (buf.length > MAX_INLINE) {
    return NextResponse.json(
      {
        error:
          "Configure BLOB_READ_WRITE_TOKEN for large uploads, or use a smaller image (under ~700KB).",
      },
      { status: 413 }
    );
  }

  const mime = file.type || "image/jpeg";
  const base64 = `data:${mime};base64,${buf.toString("base64")}`;
  return NextResponse.json({ url: base64, exif });
}
