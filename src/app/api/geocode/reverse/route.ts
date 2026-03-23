import { NextResponse } from "next/server";
import { getUserIdOr401 } from "@/lib/require-auth";
import { reverseGeocodePlace } from "@/lib/server-geocode";

export async function GET(req: Request) {
  const auth = await getUserIdOr401();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const lat = Number.parseFloat(searchParams.get("lat") ?? "");
  const lng = Number.parseFloat(searchParams.get("lng") ?? "");
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: "Invalid lat/lng" }, { status: 400 });
  }

  const label = await reverseGeocodePlace(lat, lng);
  if (!label) {
    return NextResponse.json({ error: "Could not resolve place" }, { status: 404 });
  }
  return NextResponse.json({ label });
}
