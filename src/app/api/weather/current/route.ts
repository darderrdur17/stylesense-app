import { NextResponse } from "next/server";
import { fetchCurrentWeatherByCity } from "@/lib/server-weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city")?.trim();
  if (!city) {
    return NextResponse.json({ error: "Missing city" }, { status: 400 });
  }

  const weather = await fetchCurrentWeatherByCity(city);
  return NextResponse.json(weather);
}
