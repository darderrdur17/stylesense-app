import type { WeatherData } from "./types";

/**
 * Current weather for a city — server uses Open-Meteo (no API key).
 */
export async function getWeatherByCity(city: string): Promise<WeatherData> {
  try {
    const res = await fetch(
      `/api/weather/current?city=${encodeURIComponent(city)}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("weather");
    return res.json() as Promise<WeatherData>;
  } catch {
    return getMockWeather(city);
  }
}

export async function getForecast(city: string, days: number): Promise<WeatherData[]> {
  try {
    const res = await fetch(
      `/api/weather/forecast?city=${encodeURIComponent(city)}&days=${String(days)}`,
      { credentials: "include" }
    );
    if (!res.ok) throw new Error("forecast");
    const data = (await res.json()) as { forecast: WeatherData[] };
    return data.forecast;
  } catch {
    return getMockForecast(days);
  }
}

export async function getHistoricalWeather(
  location: string,
  dateYmd: string
): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `/api/weather/historical?location=${encodeURIComponent(location)}&date=${encodeURIComponent(dateYmd)}`,
      { credentials: "include" }
    );
    if (!res.ok) return null;
    return res.json() as Promise<WeatherData>;
  } catch {
    return null;
  }
}

function getMockWeather(city: string): WeatherData {
  const hash = city.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const conditions = ["sunny", "cloudy", "rainy", "sunny", "cloudy"] as const;
  const condition = conditions[hash % conditions.length];
  const baseTemp = 15 + (hash % 15);
  return {
    temp: baseTemp,
    feelsLike: baseTemp - 2,
    condition,
    description: condition === "sunny" ? "Clear sky" : `${condition} weather`,
    humidity: 40 + (hash % 40),
    windSpeed: 5 + (hash % 15),
    icon: condition === "sunny" ? "01d" : "02d",
    high: baseTemp + 4,
    low: baseTemp - 4,
  };
}

function getMockForecast(days: number): WeatherData[] {
  const conditions = [
    "sunny",
    "cloudy",
    "rainy",
    "sunny",
    "cloudy",
    "sunny",
    "rainy",
  ] as const;
  return Array.from({ length: days }, (_, i) => ({
    temp: 18 + Math.floor(Math.random() * 10),
    feelsLike: 16 + Math.floor(Math.random() * 10),
    condition: conditions[i % conditions.length],
    description: `${conditions[i % conditions.length]} weather`,
    humidity: 40 + Math.floor(Math.random() * 40),
    windSpeed: 5 + Math.floor(Math.random() * 15),
    icon: "02d",
    high: 22 + Math.floor(Math.random() * 8),
    low: 12 + Math.floor(Math.random() * 6),
  }));
}
