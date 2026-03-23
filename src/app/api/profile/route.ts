import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdOr401 } from "@/lib/require-auth";
import { userToProfile } from "@/lib/serializers";
import { updateProfileSchema } from "@/lib/validation";

export async function PATCH(req: Request) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const email = data.email?.toLowerCase().trim();
  if (email) {
    const clash = await prisma.user.findFirst({
      where: { email, NOT: { id: auth.userId } },
    });
    if (clash) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(email !== undefined && { email }),
        ...(data.location !== undefined && { location: data.location.trim() }),
        ...(data.temperatureUnit !== undefined && { temperatureUnit: data.temperatureUnit }),
        ...(data.preferredStyles !== undefined && { preferredStyles: data.preferredStyles }),
      },
    });
    return NextResponse.json({ user: userToProfile(user) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
