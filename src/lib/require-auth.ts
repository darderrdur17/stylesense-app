import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function getUserIdOr401(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, userId: id };
}
