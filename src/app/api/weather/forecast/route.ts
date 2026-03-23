import { NextResponse } from "next/server";
import { fetchForecastByCity, fetchForecastByCoords } from "@/lib/server-weather";

function parseCoord(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseCoord(searchParams.get("lat"));
  const lng = parseCoord(searchParams.get("lng"));
  const city = searchParams.get("city")?.trim();
  const daysRaw = searchParams.get("days");
  const days = daysRaw ? Math.min(14, Math.max(1, Number.parseInt(daysRaw, 10) || 5)) : 5;

  if (lat != null && lng != null) {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }
    const forecast = await fetchForecastByCoords(lat, lng, days);
    return NextResponse.json({ forecast });
  }

  if (!city) {
    return NextResponse.json(
      { error: "Provide city or lat and lng query parameters" },
      { status: 400 }
    );
  }

  const forecast = await fetchForecastByCity(city, days);
  return NextResponse.json({ forecast });
}
