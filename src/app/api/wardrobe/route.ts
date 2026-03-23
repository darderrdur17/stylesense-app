import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOr401 } from "@/lib/require-auth";
import { clothingToClient } from "@/lib/serializers";
import { createClothingSchema } from "@/lib/validation";

function parseOptionalCaptureDate(s?: string): Date | undefined {
  if (!s?.trim()) return undefined;
  const d = new Date(s.trim());
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function POST(req: Request) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createClothingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const dateAdded = new Date();

  const row = await prisma.clothingItem.create({
    data: {
      userId: auth.userId,
      name: d.name,
      category: d.category,
      color: d.color,
      colorHex: d.colorHex,
      seasons: d.season,
      styles: d.style,
      imageUrl: d.imageUrl,
      warmthLevel: d.warmthLevel,
      waterproof: d.waterproof,
      favorite: d.favorite ?? false,
      dateAdded,
      wearCount: 0,
      photoCapturedAt: parseOptionalCaptureDate(d.photoCapturedAt),
      photoLat: d.photoLat,
      photoLng: d.photoLng,
      photoPlaceLabel: d.photoPlaceLabel?.trim() || undefined,
    },
  });

  return NextResponse.json({ item: clothingToClient(row) });
}
