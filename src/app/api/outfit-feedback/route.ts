import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOr401 } from "@/lib/require-auth";
import { outfitFeedbackSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = outfitFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { liked, itemIds, weather } = parsed.data;

  await prisma.outfitFeedback.create({
    data: {
      userId: auth.userId,
      liked,
      itemIds,
      weather: weather as object,
    },
  });

  const [total, thumbsUp] = await prisma.$transaction([
    prisma.outfitFeedback.count({ where: { userId: auth.userId } }),
    prisma.outfitFeedback.count({ where: { userId: auth.userId, liked: true } }),
  ]);

  return NextResponse.json({
    ok: true,
    feedbackStats: { total, thumbsUp },
  });
}
