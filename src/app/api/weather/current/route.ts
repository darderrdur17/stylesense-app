import { NextResponse } from "next/server";
import {
  fetchCurrentWeatherByCity,
  fetchCurrentWeatherByCoords,
} from "@/lib/server-weather";

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

  if (lat != null && lng != null) {
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }
    const weather = await fetchCurrentWeatherByCoords(lat, lng);
    return NextResponse.json(weather);
  }

  if (!city) {
    return NextResponse.json(
      { error: "Provide city or lat and lng query parameters" },
      { status: 400 }
    );
  }

  const weather = await fetchCurrentWeatherByCity(city);
  return NextResponse.json(weather);
}
