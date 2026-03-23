import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOr401 } from "@/lib/require-auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const existing = await prisma.memory.findFirst({
    where: { id, userId: auth.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.memory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
