import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOr401 } from "@/lib/require-auth";
import {
  clothingToClient,
  inspoToClient,
  memoryToClient,
  tripToClient,
  userToProfile,
} from "@/lib/serializers";

export async function GET() {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      clothingItems: { orderBy: { dateAdded: "desc" } },
      memories: { orderBy: { date: "desc" } },
      trips: { orderBy: { startDate: "desc" } },
      inspirations: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const [feedbackTotal, feedbackThumbsUp] = await prisma.$transaction([
    prisma.outfitFeedback.count({ where: { userId: auth.userId } }),
    prisma.outfitFeedback.count({ where: { userId: auth.userId, liked: true } }),
  ]);

  return NextResponse.json({
    user: userToProfile(user),
    wardrobe: user.clothingItems.map(clothingToClient),
    memories: user.memories.map(memoryToClient),
    trips: user.trips.map(tripToClient),
    inspirations: user.inspirations.map(inspoToClient),
    feedbackStats: { total: feedbackTotal, thumbsUp: feedbackThumbsUp },
  });
}
