import { NextResponse } from "next/server";
import { fetchForecastByCity } from "@/lib/server-weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")?.trim();
  const daysRaw = searchParams.get("days");
  const days = daysRaw ? Math.min(14, Math.max(1, Number.parseInt(daysRaw, 10) || 5)) : 5;

  if (!city) {
    return NextResponse.json({ error: "Missing city" }, { status: 400 });
  }

  const forecast = await fetchForecastByCity(city, days);
  return NextResponse.json({ forecast });
}
