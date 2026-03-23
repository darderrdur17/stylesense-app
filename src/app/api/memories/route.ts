import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOr401 } from "@/lib/require-auth";
import { memoryToClient } from "@/lib/serializers";
import { createMemorySchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createMemorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const row = await prisma.memory.create({
    data: {
      userId: auth.userId,
      outfit: d.outfit as object,
      photoUrl: d.photoUrl,
      location: d.location,
      lat: d.locationCoords?.lat,
      lng: d.locationCoords?.lng,
      weather: d.weather as object,
      date: new Date(`${d.date}T12:00:00.000Z`),
      mood: d.mood,
      notes: d.notes,
    },
  });

  return NextResponse.json({ memory: memoryToClient(row) });
}
