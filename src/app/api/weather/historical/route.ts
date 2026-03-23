import { NextResponse } from "next/server";
import { fetchHistoricalWeather } from "@/lib/server-weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location")?.trim();
  const date = searchParams.get("date")?.trim();

  if (!location || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Provide location and date (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const weather = await fetchHistoricalWeather(location, date);
  if (!weather) {
    return NextResponse.json(
      { error: "Could not resolve historical weather for that place and date" },
      { status: 404 }
    );
  }

  return NextResponse.json(weather);
}
