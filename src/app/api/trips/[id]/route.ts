import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOr401 } from "@/lib/require-auth";
import { tripToClient } from "@/lib/serializers";
import { updateTripSchema } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

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

  const parsed = updateTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  if (Object.keys(d).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const existing = await prisma.trip.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const row = await prisma.trip.update({
    where: { id },
    data: {
      ...(d.destination !== undefined && { destination: d.destination }),
      ...(d.startDate !== undefined && {
        startDate: new Date(`${d.startDate}T12:00:00.000Z`),
      }),
      ...(d.endDate !== undefined && {
        endDate: new Date(`${d.endDate}T12:00:00.000Z`),
      }),
      ...(d.dailyOutfits !== undefined && { dailyOutfits: d.dailyOutfits as object }),
      ...(d.packingList !== undefined && { packingList: d.packingList }),
      ...(d.status !== undefined && { status: d.status }),
    },
  });

  return NextResponse.json({ trip: tripToClient(row) });
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const existing = await prisma.trip.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.trip.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
