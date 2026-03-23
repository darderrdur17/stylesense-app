import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation";
import { DEFAULT_INSPIRATIONS } from "@/lib/seed-inspo";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const emailNorm = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailNorm,
          name: name.trim(),
          passwordHash,
          preferredStyles: ["casual", "minimalist"],
          location: "New York",
          temperatureUnit: "celsius",
        },
      });

      await tx.inspiration.createMany({
        data: DEFAULT_INSPIRATIONS.map((row) => ({
          userId: user.id,
          name: row.name,
          imageUrl: row.imageUrl,
          tags: row.tags,
        })),
      });
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
