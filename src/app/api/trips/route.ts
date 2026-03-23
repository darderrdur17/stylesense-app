import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOr401 } from "@/lib/require-auth";
import { tripToClient } from "@/lib/serializers";
import { createTripSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;

  const row = await prisma.trip.create({
    data: {
      userId: auth.userId,
      destination: d.destination,
      startDate: new Date(`${d.startDate}T12:00:00.000Z`),
      endDate: new Date(`${d.endDate}T12:00:00.000Z`),
      dailyOutfits: d.dailyOutfits as object,
      packingList: d.packingList,
      status: d.status,
    },
  });

  return NextResponse.json({ trip: tripToClient(row) });
}
