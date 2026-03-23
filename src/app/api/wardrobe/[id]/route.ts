import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOr401 } from "@/lib/require-auth";
import { clothingToClient } from "@/lib/serializers";
import { updateClothingSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

function parseOptionalCaptureDate(s?: string): Date | undefined {
  if (!s?.trim()) return undefined;
  const d = new Date(s.trim());
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateClothingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const existing = await prisma.clothingItem.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = await prisma.clothingItem.update({
    where: { id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.category !== undefined && { category: d.category }),
      ...(d.color !== undefined && { color: d.color }),
      ...(d.colorHex !== undefined && { colorHex: d.colorHex }),
      ...(d.season !== undefined && { seasons: d.season }),
      ...(d.style !== undefined && { styles: d.style }),
      ...(d.imageUrl !== undefined && { imageUrl: d.imageUrl }),
      ...(d.warmthLevel !== undefined && { warmthLevel: d.warmthLevel }),
      ...(d.waterproof !== undefined && { waterproof: d.waterproof }),
      ...(d.favorite !== undefined && { favorite: d.favorite }),
      ...(d.photoCapturedAt !== undefined && {
        photoCapturedAt: parseOptionalCaptureDate(d.photoCapturedAt),
      }),
      ...(d.photoLat !== undefined && { photoLat: d.photoLat }),
      ...(d.photoLng !== undefined && { photoLng: d.photoLng }),
      ...(d.photoPlaceLabel !== undefined && {
        photoPlaceLabel: d.photoPlaceLabel?.trim() || null,
      }),
    },
  });

  return NextResponse.json({ item: clothingToClient(row) });
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const existing = await prisma.clothingItem.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.clothingItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
